# ENVI Spectral Viewer

A [FiftyOne](https://github.com/voxel51/fiftyone) plugin for exploring hyperspectral imagery in ENVI format. Click any pixel on a hyperspectral image to instantly plot its full spectral signature — reflectance vs. wavelength — in an interactive side panel. Supports custom RGB band rendering to explore the data from different spectral perspectives.

**Spectral Profile panel with pixel selection and band controls**

![ENVI Spectral Viewer - Overview](assets/Zoomed_out.png)

**Zoomed in to 3.0× with pixel dot tracking**

![ENVI Spectral Viewer - Zoomed](assets/Zoomed_in.png)

**Full demo: zoom, pixel selection, typeable wavelength inputs, and RGB re-rendering**

![Demo](assets/hsi-demo.gif)

## What's new (v0.2)

- **Scroll-wheel zoom** (1×–15×) centered on cursor position
- **Pan** while zoomed via Alt+drag or middle-click drag
- **Double-click** to reset zoom to 1×
- **Pixel dot tracking** — the selected pixel marker follows the image through zoom and pan
- **Status bar** at the top of the panel showing current zoom level and selected pixel coordinates
- **Typeable wavelength inputs** — type an exact wavelength (in nm) next to each RGB/Gray slider; value snaps to the nearest available band on Enter or blur
- **Clear button** to reset the spectral selection

## Overview

[ENVI](https://www.nv5geospatialsoftware.com/Products/ENVI) is the standard file format for hyperspectral and multispectral imagery in remote sensing and scientific imaging. Each ENVI dataset consists of a plain-text `.hdr` header file paired with a flat binary image cube containing hundreds of spectral bands per pixel.

This plugin lets you:

- **Zoom and pan** to inspect fine details in hyperspectral images
- **Click any pixel** on a hyperspectral image to plot its full spectral profile (reflectance vs. wavelength)
- **Type exact wavelengths** or drag sliders to select which bands map to R, G, B channels
- **Re-render the RGB composite** with any band combination
- Works with **local and cloud-hosted** ENVI files (S3, GCS, Azure via FiftyOne Enterprise)
- Adapts automatically to any number of spectral bands (200, 301, etc.) — wavelength metadata is read directly from the ENVI header
- Zero required dependencies — uses a built-in ENVI BIL reader; install [`spectral`](https://www.spectralpython.net/) for full BSQ/BIP/compressed format support

## Installation

```
fiftyone plugins download https://github.com/ehofesmann/envi-spectral-viewer
```

**Optional** — install the `spectral` package for full ENVI format support (BSQ, BIP, compressed):

```
pip install spectral
```

Without `spectral`, the plugin supports BIL-interleaved ENVI files (the most common format). Attempting to open a BSQ or BIP file without `spectral` installed will raise a clear error with install instructions.

> **FiftyOne Enterprise users:** See the [custom plugins documentation](https://github.com/voxel51/fiftyone-teams-app-deploy/blob/main/docs/custom-plugins.md) for how to make additional Python packages like `spectral` available to your deployment.

## Requirements

| Requirement | Notes |
|---|---|
| `fiftyone` | Core framework |
| `numpy` | Included with FiftyOne |
| `Pillow` | Required for RGB re-rendering |
| `spectral` *(optional)* | Full ENVI format support (BSQ/BIP) |

## Sample structure

Each FiftyOne sample must have the following fields:

| Field | Type | Description |
|---|---|---|
| `filepath` | `StringField` | Path to a display image (PNG/JPEG) — typically a pseudo-RGB render of the cube |
| `hsi_filepath` | `StringField` | Path to the ENVI `.hdr` header file |
| `hsi_img_filepath` | `StringField` | Path to the ENVI binary data file (`.img`, `.dat`, etc.) |
| `hsi_shape` | `ListField` | `[rows, cols, bands]` — shape of the hyperspectral cube |
| `hsi_scale_factor` | `IntField` | Upscale factor between the display image and the ENVI cube (e.g. `4` if the PNG is 4× upscaled) |
| `wavelengths` | `ListField` | List of wavelength values in nm, one per band |

## Quickstart

A synthetic demo dataset generator is included in the `data/` directory. It creates a 512×512×200-band ENVI scene with four spectral regions (water, vegetation, soil, urban) and loads it into FiftyOne:

```
pip install fiftyone numpy Pillow
python data/create_synthetic_dataset.py
```

Then launch FiftyOne:

```python
import fiftyone as fo

dataset = fo.load_dataset("envi-synthetic-demo")
fo.launch_app(dataset)
```

Open any sample in the modal, then open the **Spectral Profile** panel. Click a pixel to see its spectral signature plotted immediately.

## Usage

### Zoom and pan

- **Scroll wheel** over the image to zoom in/out (1×–15×, cursor-centered)
- **Alt + drag** (or middle-click drag) to pan while zoomed
- **Double-click** to reset zoom to 1×
- The **status bar** at the top shows the current zoom level and selected pixel coordinates at all times

### Spectral profile

1. Open a sample in the modal
2. Open the **Spectral Profile** panel from the panel selector
3. Click any pixel on the image — the spectral plot updates instantly
4. Zoom in first to select pixels with precision — the pixel coordinates always refer to the original image dimensions
5. Click **Clear** to reset the spectral selection

### RGB band rendering

In the Spectral Profile panel:

- Use the **R / G / B sliders** to select which bands map to each channel
- Or **type an exact wavelength** (in nm) into the input field next to each slider — the value snaps to the nearest available band on Enter
- Switch between **RGB** and **Gray** (single-band) modes
- Click **Render** to update the displayed image

## Loading your own ENVI data

```python
import fiftyone as fo

dataset = fo.Dataset(name="my-hsi-dataset", persistent=True)

sample = fo.Sample(
    filepath="/path/to/display.png",       # pseudo-RGB render
    hsi_filepath="/path/to/scene.hdr",
    hsi_img_filepath="/path/to/scene.img",
    hsi_shape=[512, 512, 224],             # [rows, cols, bands]
    hsi_scale_factor=1,
    wavelengths=[400.0, 410.0, ...],       # one value per band
)

dataset.add_sample(sample)
fo.launch_app(dataset)
```

## Operators

| Operator | Description |
|---|---|
| `get_spectral_profile` | Reads a pixel's spectral signature from the ENVI cube and sends it to the panel |
| `render_rgb_image` | Re-renders the display image using user-selected band indices |
| `load_hsi_image` | Loads the display image and sends wavelength metadata to the panel |
| `show_hsi_data` | JS operator — receives data from Python and updates panel state |

## Cloud support

For cloud-hosted ENVI files (S3, GCS, Azure), the plugin:

1. Uses **FiftyOne Enterprise media cache** when available — handles download deduplication and cache eviction automatically
2. Falls back to downloading to a local temp directory for non-Teams installs with cloud paths

Local files are passed through with zero overhead.

## Development

To modify the frontend panel:

```bash
# Install JS dependencies
yarn install

# Build the panel (requires FiftyOne source for workspace resolution)
FIFTYONE_DIR=/path/to/fiftyone yarn build
```

The built output in `dist/` is what FiftyOne loads at runtime. Both `src/SpectralPanel.tsx` and `dist/` should be committed.

## Credits

Original plugin by [Eric Hofesmann](https://github.com/ehofesmann). Zoom/pan, typeable wavelength inputs, and status bar additions by [Vinay Jakkali](https://github.com/v-nayjack).