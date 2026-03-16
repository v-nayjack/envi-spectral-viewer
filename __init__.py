import base64
import io
import os
import tempfile
import numpy as np
import fiftyone.operators as foo
import fiftyone.operators.types as types
from fiftyone.operators import execution_cache


# ── Storage helpers (OSS + Enterprise compatible) ─────────────────────────────

_CLOUD_PREFIXES = ("s3://", "gs://", "az://", "http://", "https://")

def _is_local(path):
    return not any(path.startswith(p) for p in _CLOUD_PREFIXES)

def _read_file_bytes(path):
    if _is_local(path):
        with open(path, "rb") as f:
            return f.read()
    import fiftyone.core.storage as fos
    return fos.read_file(path, binary=True)

def _write_file_bytes(data, path):
    if _is_local(path):
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        with open(path, "wb") as f:
            f.write(data)
        return
    import fiftyone.core.storage as fos
    fos.write_file(data, path)


# ── Minimal ENVI BIL reader (no external dependencies) ───────────────────────

_ENVI_DTYPE_MAP = {
    "1": np.uint8,   "2": np.int16,   "3": np.int32,
    "4": np.float32, "5": np.float64, "6": np.complex64,
    "9": np.complex128, "12": np.uint16, "13": np.uint32,
    "14": np.int64,  "15": np.uint64,
}

def _parse_envi_header(hdr_path):
    params = {}
    with open(hdr_path, "r") as f:
        text = f.read()
    # collapse braced multi-line lists onto one line
    text = text.replace("\n", " ")
    for chunk in text.split(";")[0:1] or [text]:  # strip inline comments
        pass
    lines = text.replace("{", " { ").replace("}", " } ").split("=")
    # re-parse as proper key=value pairs
    raw = {}
    with open(hdr_path, "r") as f:
        content = f.read()
    # handle multi-line brace lists by collapsing them
    import re
    content = re.sub(r"\{\s*([^}]*?)\s*\}", lambda m: "{" + m.group(1).replace("\n", " ") + "}", content)
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith(";") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip().lower()
        val = val.strip()
        if val.startswith("{"):
            val = [v.strip() for v in val.strip("{}").split(",") if v.strip()]
        raw[key] = val
    return raw

class _EnviImage:
    """Minimal ENVI BIL image — supports pixel read and full load."""
    def __init__(self, hdr_path):
        hdr = _parse_envi_header(hdr_path)
        self.nrows   = int(hdr["lines"])
        self.ncols   = int(hdr["samples"])
        self.nbands  = int(hdr["bands"])
        self.offset  = int(hdr.get("header offset", 0))
        dtype        = _ENVI_DTYPE_MAP[str(hdr.get("data type", "4"))]
        byte_order   = int(hdr.get("byte order", 0))
        if byte_order == 1:
            dtype = np.dtype(dtype).newbyteorder(">")
        self.dtype   = np.dtype(dtype)
        # Locate .img file
        base = os.path.splitext(hdr_path)[0]
        for ext in (".img", ".dat", ".bin", ".sli", ""):
            candidate = base + ext
            if os.path.exists(candidate):
                self.img_path = candidate
                break
        else:
            raise FileNotFoundError(f"Cannot find ENVI image file for {hdr_path}")
        # BIL memmap shape: (rows, bands, cols)
        self._mm = np.memmap(
            self.img_path, dtype=self.dtype, mode="r",
            offset=self.offset,
            shape=(self.nrows, self.nbands, self.ncols),
        )

    def __getitem__(self, idx):
        """img[row, col, :] → spectrum as 1-D array."""
        row, col, _ = idx
        return np.array(self._mm[row, :, col])

    def load(self):
        """Load full cube as (rows, cols, bands) float32 array."""
        return np.array(self._mm).transpose(0, 2, 1).astype(np.float32)

def _envi_open(hdr_path, img_path=None):
    try:
        import spectral.io.envi as envi
        return envi.open(hdr_path, img_path)
    except ImportError:
        hdr = _parse_envi_header(hdr_path)
        interleave = hdr.get("interleave", "bil").lower()
        if interleave != "bil":
            raise RuntimeError(
                f"ENVI interleave '{interleave}' is not supported without the "
                f"'spectral' package. Install it with: pip install spectral"
            )
        return _EnviImage(hdr_path)


# ── Cloud / local path resolution ─────────────────────────────────────────────

@execution_cache(residency="ephemeral", max_size=8)
def _localize_envi(ctx, hsi_filepath, hsi_img_filepath):
    """
    Return (local_hdr_path, local_img_path) for an ENVI file, downloading from
    cloud if needed.
    - FiftyOne Teams: uses fo.media_cache when available (handles deduplication
      and cache eviction automatically).
    - Cloud paths without media_cache: downloads to a temp dir.
    - Local paths: returned as-is.
    Result is cached in-memory (up to 8 files) so repeated pixel clicks are fast.
    """
    import fiftyone as fo

    if getattr(fo, "media_cache", None) is not None:
        hdr_local = fo.media_cache.get_local_path(hsi_filepath)
        img_local = fo.media_cache.get_local_path(hsi_img_filepath)
        return hdr_local, img_local

    if _is_local(hsi_filepath):
        return hsi_filepath, hsi_img_filepath

    path_hash = str(abs(hash(hsi_filepath)))[:12]
    tmp_dir   = os.path.join(tempfile.gettempdir(), f"hsi_envi_{path_hash}")
    os.makedirs(tmp_dir, exist_ok=True)

    hdr_local = os.path.join(tmp_dir, "data.hdr")
    img_local = os.path.join(tmp_dir, "data.img")

    if not os.path.exists(hdr_local):
        _write_file_bytes(_read_file_bytes(hsi_filepath), hdr_local)
    if not os.path.exists(img_local):
        _write_file_bytes(_read_file_bytes(hsi_img_filepath), img_local)

    return hdr_local, img_local


# ── Operators ─────────────────────────────────────────────────────────────────

class LoadHsiImage(foo.Operator):
    """Loads the pseudo-RGB image and sends it to the frontend as base64."""

    @property
    def config(self):
        return foo.OperatorConfig(
            name="load_hsi_image",
            label="Load HSI Image",
            unlisted=True,
        )

    def resolve_input(self, ctx):
        inputs = types.Object()
        inputs.str("sample_id", label="Sample ID", required=True)
        return types.Property(inputs)

    def execute(self, ctx):
        sample = ctx.dataset[ctx.params["sample_id"]]
        img_bytes = _read_file_bytes(sample.filepath)
        img_b64 = base64.b64encode(img_bytes).decode()

        ctx.trigger(
            "@ehofesmann/envi-spectral-viewer/show_hsi_data",
            {
                "image_b64": img_b64,
                "sample_id": str(sample.id),
                "wavelengths": list(sample["wavelengths"]),
            },
        )


class GetSpectralProfile(foo.Operator):
    """Reads a single pixel's spectral signature from the ENVI cube."""

    @property
    def config(self):
        return foo.OperatorConfig(
            name="get_spectral_profile",
            label="Get Spectral Profile",
            unlisted=True,
        )

    def resolve_input(self, ctx):
        inputs = types.Object()
        inputs.str("sample_id", label="Sample ID", required=True)
        inputs.int("pixel_x", label="Pixel X", required=True)
        inputs.int("pixel_y", label="Pixel Y", required=True)
        return types.Property(inputs)

    def execute(self, ctx):
        sample_id = ctx.params["sample_id"]
        pixel_x   = ctx.params["pixel_x"]
        pixel_y   = ctx.params["pixel_y"]

        sample      = ctx.dataset[sample_id]
        hsi_shape   = sample["hsi_shape"]   # [rows, cols, bands]
        scale       = sample.get_field("hsi_scale_factor") or 1
        wavelengths = list(sample["wavelengths"])
        rows, cols, _ = hsi_shape

        hsi_x = int(np.clip(round(pixel_x / scale), 0, cols - 1))
        hsi_y = int(np.clip(round(pixel_y / scale), 0, rows - 1))

        local_hdr, local_img = _localize_envi(ctx, sample["hsi_filepath"], sample["hsi_img_filepath"])
        img       = _envi_open(local_hdr, local_img)
        spectrum  = img[hsi_y, hsi_x, :].flatten().tolist()

        ctx.trigger(
            "@ehofesmann/envi-spectral-viewer/show_hsi_data",
            {
                "wavelengths": wavelengths,
                "intensities": spectrum,
                "pixel_x": hsi_x,
                "pixel_y": hsi_y,
            },
        )


class RenderRgbImage(foo.Operator):
    """Re-renders the pseudo-RGB image using user-selected band indices."""

    @property
    def config(self):
        return foo.OperatorConfig(
            name="render_rgb_image",
            label="Render RGB Image",
            unlisted=True,
        )

    def resolve_input(self, ctx):
        inputs = types.Object()
        inputs.str("sample_id", label="Sample ID", required=True)
        inputs.int("r_band", label="Red band index", required=True)
        inputs.int("g_band", label="Green band index", required=True)
        inputs.int("b_band", label="Blue band index", required=True)
        return types.Property(inputs)

    def execute(self, ctx):
        from PIL import Image

        sample  = ctx.dataset[ctx.params["sample_id"]]
        r_band  = ctx.params["r_band"]
        g_band  = ctx.params["g_band"]
        b_band  = ctx.params["b_band"]

        hsi_shape           = sample["hsi_shape"]
        rows, cols, n_bands = hsi_shape
        scale               = sample.get_field("hsi_scale_factor") or 1

        local_hdr, local_img = _localize_envi(ctx, sample["hsi_filepath"], sample["hsi_img_filepath"])
        cube      = _envi_open(local_hdr, local_img).load()   # (rows, cols, bands)

        def normalize(band_data):
            p2, p98 = np.percentile(band_data, (2, 98))
            clipped = np.clip(band_data, p2, p98)
            if p98 > p2:
                return ((clipped - p2) / (p98 - p2) * 255).astype(np.uint8)
            return np.zeros_like(band_data, dtype=np.uint8)

        r = normalize(cube[:, :, np.clip(r_band, 0, n_bands - 1)].squeeze())
        g = normalize(cube[:, :, np.clip(g_band, 0, n_bands - 1)].squeeze())
        b = normalize(cube[:, :, np.clip(b_band, 0, n_bands - 1)].squeeze())
        rgb = np.stack([r, g, b], axis=2)

        pil_img = Image.fromarray(rgb).resize(
            (cols * scale, rows * scale), Image.NEAREST
        )
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        img_b64 = base64.b64encode(buf.getvalue()).decode()

        ctx.trigger(
            "@ehofesmann/envi-spectral-viewer/show_hsi_data",
            {
                "image_b64": img_b64,
                "rgb_bands": {"r": r_band, "g": g_band, "b": b_band},
            },
        )


def register(p):
    p.register(LoadHsiImage)
    p.register(GetSpectralProfile)
    p.register(RenderRgbImage)
