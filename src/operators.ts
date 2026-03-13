import {
  Operator,
  OperatorConfig,
  registerOperator,
} from "@fiftyone/operators";
import { useSetRecoilState } from "recoil";
import {
  hsiChannelModeAtom,
  hsiGrayBandAtom,
  hsiImageAtom,
  hsiLoadingAtom,
  hsiRgbBandsAtom,
  hsiSampleIdAtom,
  hsiSpectrumAtom,
  hsiWavelengthsAtom,
} from "./atoms";

/**
 * Receives data from Python operators and updates React state.
 * Handles both image load results and spectrum query results.
 */
class ShowHsiData extends Operator {
  get config() {
    return new OperatorConfig({
      name: "show_hsi_data",
      label: "Show HSI Data",
      unlisted: true,
    });
  }

  useHooks() {
    return {
      setImage: useSetRecoilState(hsiImageAtom),
      setSampleId: useSetRecoilState(hsiSampleIdAtom),
      setSpectrum: useSetRecoilState(hsiSpectrumAtom),
      setLoading: useSetRecoilState(hsiLoadingAtom),
      setWavelengths: useSetRecoilState(hsiWavelengthsAtom),
      setRgbBands: useSetRecoilState(hsiRgbBandsAtom),
    };
  }

  async execute({ hooks, params }: { hooks: any; params: any }) {
    hooks.setLoading(false);
    if (params.image_b64 != null) {
      hooks.setImage(`data:image/png;base64,${params.image_b64}`);
    }
    if (params.sample_id != null) {
      hooks.setSampleId(params.sample_id);
    }
    if (params.wavelengths != null && params.intensities == null) {
      // wavelengths from initial load — populate sliders and set RGB bands
      // to match the PNG thumbnails (generated with 660/550/460nm)
      hooks.setWavelengths(params.wavelengths);
      const nearest = (targetNm: number) =>
        (params.wavelengths as number[]).reduce((best: number, wl: number, i: number) =>
          Math.abs(wl - targetNm) < Math.abs((params.wavelengths as number[])[best] - targetNm) ? i : best, 0);
      hooks.setRgbBands({ r: nearest(660), g: nearest(550), b: nearest(460) });
    }
    if (params.wavelengths != null && params.intensities != null) {
      // spectrum from pixel click
      hooks.setSpectrum({
        wavelengths: params.wavelengths,
        intensities: params.intensities,
        pixel_x: params.pixel_x,
        pixel_y: params.pixel_y,
      });
    }
    if (params.rgb_bands != null) {
      hooks.setRgbBands(params.rgb_bands);
    }
  }
}

registerOperator(ShowHsiData, "@ehofesmann/envi-spectral-viewer");
