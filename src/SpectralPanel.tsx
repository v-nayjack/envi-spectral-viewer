import { LoadingSpinner } from "@fiftyone/components";
import { executeOperator } from "@fiftyone/operators";
import * as fos from "@fiftyone/state";
import { Typography } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import {
  ChannelMode,
  hsiChannelModeAtom,
  hsiGrayBandAtom,
  hsiImageAtom,
  hsiLoadingAtom,
  hsiRgbBandsAtom,
  hsiSampleIdAtom,
  hsiSpectrumAtom,
  hsiWavelengthsAtom,
} from "./atoms";

// ── Wavelength → visible color ────────────────────────────────────────────────

function wavelengthToColor(nm: number): string {
  let r = 0, g = 0, b = 0, factor = 1;
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / 60; g = 0; b = 1;
    factor = 0.3 + 0.7 * (nm - 380) / 60;
  } else if (nm < 490) {
    r = 0; g = (nm - 440) / 50; b = 1;
  } else if (nm < 510) {
    r = 0; g = 1; b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70; g = 1; b = 0;
  } else if (nm < 645) {
    r = 1; g = -(nm - 645) / 65; b = 0;
  } else if (nm <= 780) {
    r = 1; g = 0; b = 0;
    factor = nm > 700 ? 0.3 + 0.7 * (780 - nm) / 80 : 1;
  } else {
    // NIR / SWIR — fade from salmon to muted purple-gray
    const t = Math.min((nm - 780) / 1700, 1);
    const r = Math.round(220 - 150 * t);
    const g = Math.round(100 - 70 * t);
    const b = Math.round(120 + 60 * t);
    return `rgb(${r},${g},${b})`;
  }
  return `rgb(${Math.round(255 * r * factor)},${Math.round(255 * g * factor)},${Math.round(255 * b * factor)})`;
}

// Build SVG linearGradient stops across a wavelength range
function buildGradientStops(minWl: number, maxWl: number) {
  const keyNm = [380, 420, 440, 460, 490, 510, 540, 580, 610, 645, 700, 780, 900, 1200, 1600, 2480];
  return keyNm
    .filter((nm) => nm >= minWl && nm <= maxWl)
    .map((nm) => ({
      offset: `${(((nm - minWl) / (maxWl - minWl)) * 100).toFixed(1)}%`,
      color: wavelengthToColor(nm),
    }));
}

// ── Styles ────────────────────────────────────────────────────────────────────

const Container = styled.div`
  padding: 0.75em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.75em;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const LeftCol = styled.div`
  flex: 0 0 45%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
`;

const RightCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4em;
`;

const ImageInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const HsiImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center top;
  display: block;
  cursor: crosshair;
  border-radius: 4px;
  border: 1px solid #333;
`;

const PixelDot = styled.div<{ x: number; y: number }>`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #f87171;
  transform: translate(-50%, -50%);
  pointer-events: none;
  left: ${({ x }) => x}px;
  top: ${({ y }) => y}px;
`;

const ChartWrap = styled.div`
  background: #111;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  padding: 10px;
  flex: 1;
`;

const Hint = styled.div`
  color: #555;
  font-size: 12px;
  font-style: italic;
`;

/* ── Bottom bar (horizontal controls) ── */

const BottomBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 6px;
  padding: 6px 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
`;

const ChannelGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
  min-width: 0;
`;

const SliderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const ChannelDot = styled.span<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
  flex-shrink: 0;
`;

const BandSlider = styled.input<{ $color: string }>`
  flex: 1;
  min-width: 40px;
  accent-color: ${({ $color }) => $color};
  cursor: pointer;
`;

const BandLabel = styled.span`
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 64px;
`;

const PixelInfo = styled.span`
  font-size: 10px;
  color: #555;
  white-space: nowrap;
  flex-shrink: 0;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModeToggle = styled.div`
  display: flex;
  border: 1px solid #333;
  border-radius: 4px;
  overflow: hidden;
`;

const ModeBtn = styled.button<{ $active: boolean }>`
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "#3f3f46" : "#1a1a1a")};
  color: ${({ $active }) => ($active ? "#fff" : "#666")};
  &:hover { background: #3f3f46; color: #fff; }
`;

const RenderBtn = styled.button`
  width: 64px;
  height: 26px;
  background: #ff6d04;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover:not(:disabled) { background: #e05c00; }
  &:disabled { opacity: 0.6; cursor: default; }
`;

// ── SVG Spectral Chart ────────────────────────────────────────────────────────

interface BandLine {
  bandIdx: number;
  color: string;
  label: string;
}

interface ChartProps {
  wavelengths: number[];
  intensities?: number[];
  bandLines?: BandLine[];
  loading?: boolean;
}

function SpectralChart({ wavelengths, intensities, bandLines = [], loading = false }: ChartProps) {
  const W = 460, H = 140;
  const PAD = { top: 10, right: 10, bottom: 28, left: 44 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const isEmpty = !intensities || intensities.length === 0;

  const minWl = wavelengths[0];
  const maxWl = wavelengths[wavelengths.length - 1];
  const minI = isEmpty ? 0 : Math.min(...intensities!);
  const maxI = isEmpty ? 1 : Math.max(...intensities!);
  const rangeI = maxI - minI || 1;

  const toX = (wl: number) => ((wl - minWl) / (maxWl - minWl)) * iW;
  const toY = (v: number) => iH - ((v - minI) / rangeI) * iH;

  const gradientStops = buildGradientStops(minWl, maxWl);
  const gradId = "spectrumGrad";

  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    wl: Math.round(minWl + t * (maxWl - minWl)),
    x: t * iW,
  }));
  const yTicks = isEmpty
    ? [0, 0.5, 1].map((t) => ({ val: "—", y: iH - t * iH }))
    : [0, 0.5, 1].map((t) => ({
        val: (minI + t * rangeI).toFixed(1),
        y: iH - t * iH,
      }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          {gradientStops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>

      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Grid */}
        {yTicks.map((t, i) => (
          <line key={i} x1={0} y1={t.y} x2={iW} y2={t.y} stroke="#1e1e1e" strokeWidth={1} />
        ))}

        {/* Band indicator lines */}
        {bandLines.map((bl, i) => {
          const wl = wavelengths[bl.bandIdx];
          if (wl == null) return null;
          const x = toX(wl);
          return (
            <g key={i}>
              <line
                x1={x} y1={0} x2={x} y2={iH}
                stroke={bl.color} strokeWidth={1.5}
                strokeDasharray="4,3" opacity={0.8}
              />
              <text x={x + 3} y={8} fill={bl.color} fontSize={8} opacity={0.9}>
                {bl.label}
              </text>
            </g>
          );
        })}

        {/* Empty state / loading state */}
        {isEmpty && (
          <>
            <rect
              x={0} y={iH / 2 - 1} width={iW} height={2}
              fill={`url(#${gradId})`} opacity={loading ? 0.5 : 0.25}
            >
              {loading && (
                <animate attributeName="opacity" values="0.5;0.15;0.5" dur="1.4s" repeatCount="indefinite" />
              )}
            </rect>
            {loading ? (
              <text
                x={iW / 2} y={iH / 2}
                textAnchor="middle" dominantBaseline="middle"
                fill="#ff6d04" fontSize={10}
              >
                Loading spectrum…
                <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
              </text>
            ) : (
              <>
                <text
                  x={iW / 2} y={iH / 2 - 10}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#555" fontSize={10}
                >
                  Click a pixel on the image
                </text>
                <text
                  x={iW / 2} y={iH / 2 + 8}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#3a3a3a" fontSize={9}
                >
                  to plot its spectral signature here
                </text>
              </>
            )}
          </>
        )}

        {/* Spectrum line — dimmed while loading next pixel */}
        {!isEmpty && (
          <polyline
            points={intensities!.map((v, i) => `${toX(wavelengths[i])},${toY(v)}`).join(" ")}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={2}
            strokeLinejoin="round"
            opacity={loading ? 0.25 : 1}
          />
        )}

        {/* Loading overlay when re-fetching with a previous spectrum visible */}
        {!isEmpty && loading && (
          <text
            x={iW / 2} y={iH / 2}
            textAnchor="middle" dominantBaseline="middle"
            fill="#ff6d04" fontSize={10}
          >
            Loading spectrum…
            <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
          </text>
        )}

        {/* X axis */}
        <line x1={0} y1={iH} x2={iW} y2={iH} stroke="#444" strokeWidth={1} />
        {xTicks.map((t, i) => (
          <g key={i} transform={`translate(${t.x},${iH})`}>
            <line y2={4} stroke="#444" strokeWidth={1} />
            <text y={14} textAnchor="middle" fill="#666" fontSize={9}>{t.wl}</text>
          </g>
        ))}
        <text x={iW / 2} y={iH + 26} textAnchor="middle" fill="#444" fontSize={9}>
          Wavelength (nm)
        </text>

        {/* Y axis */}
        <line x1={0} y1={0} x2={0} y2={iH} stroke="#444" strokeWidth={1} />
        <text
          transform={`translate(${-PAD.left + 10},${iH / 2}) rotate(-90)`}
          textAnchor="middle"
          fill="#444"
          fontSize={9}
        >
          Intensity
        </text>
        {yTicks.map((t, i) => (
          <g key={i} transform={`translate(0,${t.y})`}>
            <line x1={-4} stroke="#444" strokeWidth={1} />
            <text x={-6} textAnchor="end" dominantBaseline="middle" fill="#444" fontSize={8}>
              {t.val}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── Band Controls ─────────────────────────────────────────────────────────────

const RGB_CHANNELS = [
  { key: "r" as const, color: "#f87171", label: "R" },
  { key: "g" as const, color: "#4ade80", label: "G" },
  { key: "b" as const, color: "#60a5fa", label: "B" },
];

function BandControls({
  sampleId,
  spectrum,
}: {
  sampleId: string | null;
  spectrum: any;
}) {
  const wavelengths = useRecoilValue(hsiWavelengthsAtom);
  const [bands, setBands] = useRecoilState(hsiRgbBandsAtom);
  const [grayBand, setGrayBand] = useRecoilState(hsiGrayBandAtom);
  const [mode, setMode] = useRecoilState(hsiChannelModeAtom);
  const [rendering, setRendering] = useRecoilState(hsiLoadingAtom);
  const maxBand = wavelengths.length > 0 ? wavelengths.length - 1 : 199;

  const wlLabel = (idx: number) =>
    wavelengths.length > 0 ? `${wavelengths[idx]?.toFixed(0)}nm` : `#${idx}`;

  const handleRender = useCallback(() => {
    if (!sampleId) return;
    setRendering(true);
    if (mode === "rgb") {
      executeOperator("@ehofesmann/envi-spectral-viewer/render_rgb_image", {
        sample_id: sampleId,
        r_band: bands.r,
        g_band: bands.g,
        b_band: bands.b,
      });
    } else {
      executeOperator("@ehofesmann/envi-spectral-viewer/render_rgb_image", {
        sample_id: sampleId,
        r_band: grayBand,
        g_band: grayBand,
        b_band: grayBand,
      });
    }
  }, [sampleId, mode, bands, grayBand]);

  return (
    <BottomBar>
      <ModeToggle>
        <ModeBtn $active={mode === "rgb"} onClick={() => setMode("rgb")}>RGB</ModeBtn>
        <ModeBtn $active={mode === "gray"} onClick={() => setMode("gray")}>Gray</ModeBtn>
      </ModeToggle>

      <ChannelGroup>
        {mode === "rgb" ? (
          RGB_CHANNELS.map(({ key, color, label }) => (
            <SliderItem key={key}>
              <ChannelDot color={color} />
              <BandLabel style={{ color }}>{label}: {wlLabel(bands[key])}</BandLabel>
              <BandSlider
                type="range"
                $color={color}
                min={0} max={maxBand}
                value={bands[key]}
                onChange={(e) =>
                  setBands((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
              />
            </SliderItem>
          ))
        ) : (
          <SliderItem>
            <ChannelDot color="#aaa" />
            <BandLabel style={{ color: "#aaa" }}>Band: {wlLabel(grayBand)}</BandLabel>
            <BandSlider
              type="range"
              $color="#aaa"
              min={0} max={maxBand}
              value={grayBand}
              onChange={(e) => setGrayBand(Number(e.target.value))}
            />
          </SliderItem>
        )}
      </ChannelGroup>

      {sampleId && (
        <RenderBtn onClick={handleRender} disabled={rendering}>
          {rendering ? <LoadingSpinner size="small" color="base" /> : "Render"}
        </RenderBtn>
      )}

      {spectrum && (
        <PixelInfo>
          ({spectrum.pixel_x}, {spectrum.pixel_y})
        </PixelInfo>
      )}
    </BottomBar>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export function SpectralPanel() {
  const dataset = useRecoilValue(fos.dataset);
  const [image, setImage] = useRecoilState(hsiImageAtom);
  const [sampleId] = useRecoilState(hsiSampleIdAtom);
  const [loading, setLoading] = useRecoilState(hsiLoadingAtom);
  const wavelengths = useRecoilValue(hsiWavelengthsAtom);
  const [, setWavelengths] = useRecoilState(hsiWavelengthsAtom);
  const [spectrum, setSpectrum] = useRecoilState(hsiSpectrumAtom);
  const bands = useRecoilValue(hsiRgbBandsAtom);
  const grayBand = useRecoilValue(hsiGrayBandAtom);
  const mode = useRecoilValue(hsiChannelModeAtom);

  // Track which sample is currently open in the modal
  const currentSampleId: string | null = useRecoilValue(fos.currentSampleId as any);

  const dotPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!dataset || !currentSampleId) return;
    if (currentSampleId === sampleId) return; // already loaded

    // Clear stale state from previous sample
    setImage(null);
    setSpectrum(null);
    setWavelengths([]);
    dotPosRef.current = null;

    setLoading(true);
    executeOperator("@ehofesmann/envi-spectral-viewer/load_hsi_image", { sample_id: currentSampleId });
  }, [currentSampleId, dataset]);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (!sampleId) return;
      const img = e.target as HTMLImageElement;
      const rect = img.getBoundingClientRect();
      const displayX = e.clientX - rect.left;
      const displayY = e.clientY - rect.top;

      // With object-fit: contain + object-position: left top, the rendered
      // image content starts at (0,0) and is constrained by whichever axis hits first.
      const natAspect = img.naturalWidth / img.naturalHeight;
      const elAspect  = rect.width / rect.height;
      const renderedW = natAspect > elAspect ? rect.width  : rect.height * natAspect;
      const renderedH = natAspect > elAspect ? rect.width / natAspect : rect.height;

      // object-position: center top → image is horizontally centered, top-aligned
      const offsetX = (rect.width - renderedW) / 2;
      const imgX = displayX - offsetX;
      const imgY = displayY;

      if (imgX < 0 || imgX > renderedW || imgY > renderedH) return; // click in blank area

      const pixel_x = Math.round((imgX / renderedW) * img.naturalWidth);
      const pixel_y = Math.round((imgY / renderedH) * img.naturalHeight);
      dotPosRef.current = { x: displayX, y: imgY };
      setLoading(true);
      executeOperator("@ehofesmann/envi-spectral-viewer/get_spectral_profile", {
        sample_id: sampleId,
        pixel_x,
        pixel_y,
      });
    },
    [sampleId]
  );

  // Build band lines for the spectrum chart
  const bandLines = spectrum
    ? mode === "rgb"
      ? [
          { bandIdx: bands.r, color: "#f87171", label: "R" },
          { bandIdx: bands.g, color: "#4ade80", label: "G" },
          { bandIdx: bands.b, color: "#60a5fa", label: "B" },
        ]
      : [{ bandIdx: grayBand, color: "#aaa", label: "Gray" }]
    : [];

  return (
    <Container>
      <TopSection>
        {/* Left: image */}
        <LeftCol>
          {loading && !image && <Hint>Loading…</Hint>}
          {image && (
            <ImageInner>
              <HsiImage
                src={image}
                alt="HSI pseudo-RGB"
                onClick={handleImageClick}
                title="Click a pixel to see its spectral profile"
              />
              {dotPosRef.current && spectrum && (
                <PixelDot x={dotPosRef.current.x} y={dotPosRef.current.y} />
              )}
            </ImageInner>
          )}
        </LeftCol>

        {/* Right: spectral chart */}
        <RightCol>
          {wavelengths.length > 0 && (
            <ChartWrap>
              <SpectralChart
                wavelengths={wavelengths}
                intensities={spectrum?.intensities}
                bandLines={bandLines}
                loading={loading && !!image}
              />
            </ChartWrap>
          )}
        </RightCol>
      </TopSection>

      {/* Bottom: horizontal channel controls */}
      <BandControls sampleId={sampleId} spectrum={spectrum} />
    </Container>
  );
}
