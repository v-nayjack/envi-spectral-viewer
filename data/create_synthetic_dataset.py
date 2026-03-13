"""
Generate a synthetic ENVI hyperspectral dataset and load it into FiftyOne.

Creates a 512x512 scene with 200 bands (400-2500nm) containing four visually
distinct spectral regions: water, vegetation, soil, and urban/concrete.
Spectral signatures are based on realistic reflectance curves for each material.

Usage:
    # Local / OSS
    python create_synthetic_dataset.py

    # FiftyOne Enterprise (set env vars first)
    FIFTYONE_API_URI=https://your-deployment.fiftyone.ai \
    FIFTYONE_API_KEY=your-api-key \
    python create_synthetic_dataset.py
"""

import os
import io
import struct
import numpy as np
from PIL import Image

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
OUT_DIR     = os.path.join(SCRIPT_DIR, "synthetic")
os.makedirs(OUT_DIR, exist_ok=True)

DATASET_NAME = "envi-synthetic-demo"
ROWS, COLS   = 512, 512
N_BANDS      = 200
SCALE        = 2   # display upscale (1024x1024 PNG)

# ── Wavelengths: 400–2500 nm, 200 bands ───────────────────────────────────────

WAVELENGTHS = np.linspace(400, 2500, N_BANDS).tolist()

# ── Spectral signatures (key wavelength → reflectance, then interpolated) ─────
# Values are approximate normalised reflectance (0–1) based on real material curves.

_SIGNATURES = {
    "water": {
        400: 0.07, 500: 0.06, 550: 0.05, 600: 0.03,
        700: 0.015, 800: 0.005, 900: 0.003,
        1000: 0.002, 1500: 0.001, 2000: 0.001, 2500: 0.001,
    },
    "vegetation": {
        400: 0.05, 500: 0.10, 550: 0.13, 600: 0.06,
        670: 0.04,   # chlorophyll absorption
        720: 0.20,   # red edge
        800: 0.50, 900: 0.52, 1000: 0.50,
        1200: 0.42,
        1400: 0.12,  # water absorption
        1600: 0.28,
        1900: 0.08,  # water absorption
        2100: 0.18,
        2500: 0.12,
    },
    "soil": {
        400: 0.10, 500: 0.15, 600: 0.22, 700: 0.28,
        800: 0.32, 1000: 0.36,
        1400: 0.28, 1600: 0.40,
        1900: 0.32, 2100: 0.40, 2500: 0.36,
    },
    "urban": {
        400: 0.20, 500: 0.23, 600: 0.27, 700: 0.30,
        800: 0.33, 1000: 0.35,
        1400: 0.32, 1600: 0.38,
        1900: 0.33, 2100: 0.36, 2500: 0.34,
    },
}

def make_spectrum(name):
    """Interpolate a material signature to the full wavelength grid."""
    pts = _SIGNATURES[name]
    wl_keys = sorted(pts.keys())
    return np.interp(WAVELENGTHS, wl_keys, [pts[k] for k in wl_keys]).astype(np.float32)

SPECTRA = {k: make_spectrum(k) for k in _SIGNATURES}

# ── Scene layout ───────────────────────────────────────────────────────────────
# Build a membership mask: each pixel assigned a primary material + blend weight.
#
# Layout (bird's-eye view):
#   +--water--+--urban--+
#   |         |         |
#   +--veget--+--soil---+
#
# Transitions between regions use a smooth cosine blend over ~32 pixels.

def smooth_blend(dist, width=32):
    """0→1 blend over `width` pixels from a region boundary."""
    return np.clip((width - dist) / width, 0, 1) * 0.5 * (1 - np.cos(np.pi * np.clip((width - dist) / width, 0, 1)))

def build_scene():
    """Return float32 cube (ROWS, COLS, N_BANDS)."""
    yy, xx = np.mgrid[0:ROWS, 0:COLS].astype(np.float32)

    # Distance from the horizontal midline (positive = bottom half)
    dy_top    = ROWS / 2 - yy          # >0 in top half
    dy_bottom = yy - ROWS / 2          # >0 in bottom half
    dx_left   = COLS / 2 - xx          # >0 in left half
    dx_right  = xx - COLS / 2          # >0 in right half

    # Blend weights for each quadrant
    w_top    = np.clip(dy_top    / 48, 0, 1)
    w_bottom = np.clip(dy_bottom / 48, 0, 1)
    w_left   = np.clip(dx_left   / 48, 0, 1)
    w_right  = np.clip(dx_right  / 48, 0, 1)

    w_water  = w_top  * w_left
    w_urban  = w_top  * w_right
    w_veg    = w_bottom * w_left
    w_soil   = w_bottom * w_right

    # Normalise so weights sum to 1 everywhere
    total = w_water + w_urban + w_veg + w_soil + 1e-8
    w_water /= total; w_urban /= total
    w_veg   /= total; w_soil  /= total

    # Add per-pixel noise for realism (~2% stddev)
    rng  = np.random.default_rng(42)
    noise = rng.normal(0, 0.02, (ROWS, COLS, N_BANDS)).astype(np.float32)

    cube = (
        w_water[:, :, None] * SPECTRA["water"]   +
        w_urban[:, :, None] * SPECTRA["urban"]   +
        w_veg  [:, :, None] * SPECTRA["vegetation"] +
        w_soil [:, :, None] * SPECTRA["soil"]
    ) + noise

    return np.clip(cube, 0, 1)

# ── Write ENVI BIL file ────────────────────────────────────────────────────────

def write_envi(cube, hdr_path, img_path):
    """Write (rows, cols, bands) float32 cube to ENVI BIL format."""
    rows, cols, bands = cube.shape
    # BIL on disk: (rows, bands, cols)
    bil = cube.transpose(0, 2, 1).astype(np.float32)
    bil.tofile(img_path)

    wl_str = ", ".join(f"{w:.2f}" for w in WAVELENGTHS)
    with open(hdr_path, "w") as f:
        f.write(f"""ENVI
description = {{ Synthetic hyperspectral demo scene }}
samples = {cols}
lines   = {rows}
bands   = {bands}
header offset = 0
file type = ENVI Standard
data type = 4
interleave = bil
byte order = 0
wavelength units = Nanometers
wavelength = {{{wl_str}}}
""")
    print(f"  Wrote ENVI: {img_path}  ({os.path.getsize(img_path)/1e6:.1f} MB)")

# ── Generate pseudo-RGB PNG ────────────────────────────────────────────────────

def nearest_band(target_nm):
    return int(np.argmin(np.abs(np.array(WAVELENGTHS) - target_nm)))

def normalize(arr):
    p2, p98 = np.percentile(arr, (2, 98))
    if p98 > p2:
        return np.clip((arr - p2) / (p98 - p2) * 255, 0, 255).astype(np.uint8)
    return np.zeros_like(arr, dtype=np.uint8)

def write_rgb(cube, png_path, scale=2):
    r = normalize(cube[:, :, nearest_band(660)])
    g = normalize(cube[:, :, nearest_band(550)])
    b = normalize(cube[:, :, nearest_band(460)])
    rgb = np.stack([r, g, b], axis=2)
    img = Image.fromarray(rgb)
    if scale > 1:
        img = img.resize((COLS * scale, ROWS * scale), Image.NEAREST)
    img.save(png_path)
    print(f"  Wrote PNG:  {png_path}")

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    import fiftyone as fo

    api_uri = os.environ.get("FIFTYONE_API_URI", "")
    target  = api_uri or "localhost OSS"
    print(f"\nTarget: {target}")
    print(f"Generating {ROWS}×{COLS}×{N_BANDS} synthetic ENVI scene...")

    cube = build_scene()
    print(f"  Cube shape: {cube.shape}, dtype: {cube.dtype}")

    hdr_path = os.path.join(OUT_DIR, "synthetic_scene.hdr")
    img_path = os.path.join(OUT_DIR, "synthetic_scene.img")
    png_path = os.path.join(OUT_DIR, "synthetic_scene_rgb.png")

    write_envi(cube, hdr_path, img_path)
    write_rgb(cube, png_path, scale=SCALE)

    # Create dataset
    if fo.dataset_exists(DATASET_NAME):
        fo.delete_dataset(DATASET_NAME)

    dataset = fo.Dataset(name=DATASET_NAME, persistent=True)
    sample  = fo.Sample(
        filepath          = png_path,
        hsi_filepath      = hdr_path,
        hsi_img_filepath  = img_path,
        hsi_shape         = [ROWS, COLS, N_BANDS],
        hsi_scale_factor  = SCALE,
        wavelengths       = WAVELENGTHS,
    )
    dataset.add_sample(sample)

    for field in ("hsi_filepath", "hsi_img_filepath"):
        if field not in dataset.app_config.media_fields:
            dataset.app_config.media_fields.append(field)
    dataset.save()

    print(f"\nDataset '{DATASET_NAME}' created ({len(dataset)} sample)")
    print(f"  Wavelengths: {WAVELENGTHS[0]:.0f}–{WAVELENGTHS[-1]:.0f} nm")

    # Upload media if targeting a remote deployment
    if api_uri:
        print("\nUploading media to deployment...")
        import fiftyone.core.storage as fos
        for field in ("filepath", "hsi_filepath", "hsi_img_filepath"):
            print(f"  Uploading {field}...")
            fos.upload_media(dataset, media_field=field, overwrite=True)
        print("  Upload complete.")

    print("\nDone.")

if __name__ == "__main__":
    main()
