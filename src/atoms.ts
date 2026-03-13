import { atom } from "recoil";

export interface SpectrumData {
  wavelengths: number[];
  intensities: number[];
  pixel_x: number;
  pixel_y: number;
}

export const hsiImageAtom = atom<string | null>({
  key: "hsiVisualizerImage_v1",
  default: null,
});

export const hsiSampleIdAtom = atom<string | null>({
  key: "hsiVisualizerSampleId_v1",
  default: null,
});

export const hsiSpectrumAtom = atom<SpectrumData | null>({
  key: "hsiVisualizerSpectrum_v1",
  default: null,
});

export const hsiLoadingAtom = atom<boolean>({
  key: "hsiVisualizerLoading_v1",
  default: false,
});

export const hsiWavelengthsAtom = atom<number[]>({
  key: "hsiVisualizerWavelengths_v1",
  default: [],
});

export interface RgbBands {
  r: number;
  g: number;
  b: number;
}

export const hsiRgbBandsAtom = atom<RgbBands>({
  key: "hsiVisualizerRgbBands_v1",
  default: { r: 27, g: 16, b: 6 }, // default: 658nm, 553nm, 457nm
});

export type ChannelMode = "rgb" | "gray";

export const hsiChannelModeAtom = atom<ChannelMode>({
  key: "hsiVisualizerChannelMode_v1",
  default: "rgb",
});

export const hsiGrayBandAtom = atom<number>({
  key: "hsiVisualizerGrayBand_v1",
  default: 16, // ~553nm
});
