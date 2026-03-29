import { LoadingSpinner } from "@fiftyone/components";
import { executeOperator } from "@fiftyone/operators";
import * as fos from "@fiftyone/state";
import { Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
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

/* ── Zoom: outer clip container ── */
const ZoomContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: crosshair;
`;

/* ── Zoom: inner transformable wrapper ── */
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

/* ── Zoom indicator badge ── */
const ZoomBadge = styled.div`
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: #ccc;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  pointer-events: none;
  z-index: 10;
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

const ClearBtn = styled.button`
  width: 52px;
  height: 26px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #999;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: #3f3f46; color: #fff; border-color: #555; }
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
    : [0, 0.5, 1].map((t) => {
        const val = minI + t * rangeI;
        return { val: val > 100 ? val.toFixed(0) : val.toFixed(1), y: iH - t * iH };
      });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          {gradientStops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>

      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Empty-state prompt */}
        {isEmpty && !loading && (
          <text
            x={iW / 2} y={iH / 2}
            textAnchor="middle" dominantBaseline="middle"
            fill="#555" fontSize={11}
          >
            Click a pixel to view its spectrum
          </text>
        )}

        {/* Loading indicator when no previous spectrum */}
        {isEmpty && loading && (
          <text
            x={iW / 2} y={iH / 2}
            textAnchor="middle" dominantBaseline="middle"
            fill="#ff6d04" fontSize={11}
          >
            Loading spectrum…
            <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
          </text>
        )}

        {/* Band indicator lines */}
        {bandLines.map((bl, i) => {
          if (bl.bandIdx < 0 || bl.bandIdx >= wavelengths.length) return null;
          const x = toX(wavelengths[bl.bandIdx]);
          return (
            <g key={i}>
              <line x1={x} y1={0} x2={x} y2={iH} stroke={bl.color} strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
              <text x={x} y={-2} textAnchor="middle" fill={bl.color} fontSize={8}>{bl.label}</text>
            </g>
          );
        })}

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
  onClear,
}: {
  sampleId: string | null;
  spectrum: any;
  onClear: () => void;
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
        <ClearBtn onClick={onClear}>Clear</ClearBtn>
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

  // Pixel dot position (screen coords for overlay)
  const dotPosRef = useRef<{ x: number; y: number } | null>(null);

  // ── Ref for ZoomContainer (reliable coordinate mapping) ───────────────────
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // ── Zoom & pan state ──────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  // ── Load HSI data when sample changes ─────────────────────────────────────
  useEffect(() => {
    if (!dataset || !currentSampleId) return;
    if (currentSampleId === sampleId) return; // already loaded

    // Clear stale state from previous sample
    setImage(null);
    setSpectrum(null);
    setWavelengths([]);
    dotPosRef.current = null;

    // Reset zoom when switching samples
    setZoom(1);
    setPan({ x: 0, y: 0 });

    setLoading(true);
    executeOperator("@ehofesmann/envi-spectral-viewer/load_hsi_image", { sample_id: currentSampleId });
  }, [currentSampleId, dataset]);

  // ── Zoom via mouse wheel ──────────────────────────────────────────────────
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const container = zoomContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      // Cursor position relative to the container
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const prevZoom = zoom;
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      const nextZoom = Math.min(Math.max(prevZoom + delta * prevZoom, 1), 15);

      // Adjust pan so the point under the cursor stays fixed
      const scale = nextZoom / prevZoom;
      const newPanX = cursorX - scale * (cursorX - pan.x);
      const newPanY = cursorY - scale * (cursorY - pan.y);

      setZoom(nextZoom);
      setPan(nextZoom <= 1 ? { x: 0, y: 0 } : { x: newPanX, y: newPanY });
    },
    [zoom, pan]
  );

  // ── Pan via Alt+drag ──────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (zoom <= 1) return;
      // Pan on middle-click or Alt+left-click
      if (e.button === 1 || e.altKey) {
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY };
        panOrigin.current = { ...pan };
      }
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy });
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // ── Double-click to reset zoom ────────────────────────────────────────────
  const handleDoubleClick = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    dotPosRef.current = null;
  }, []);

  // ── Clear spectrum selection ──────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setSpectrum(null);
    dotPosRef.current = null;
  }, []);

  // ── Click to select pixel (zoom-aware) ────────────────────────────────────
  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (!sampleId || isPanning.current) return;
      // Alt+click is for panning, not pixel selection
      if (e.altKey) return;

      const img = imgRef.current;
      const container = zoomContainerRef.current;
      if (!img || !container) return;
      const rect = container.getBoundingClientRect();

      // Cursor position relative to the ZoomContainer
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      // Reverse the zoom/pan transform to get position in unzoomed space
      const unzoomedX = (cursorX - pan.x) / zoom;
      const unzoomedY = (cursorY - pan.y) / zoom;

      // Map from unzoomed display coords to actual pixel coords
      // (object-fit: contain with center-top alignment)
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      const natAspect = natW / natH;

      // The container's logical (unzoomed) size
      const containerW = rect.width;
      const containerH = rect.height;
      const elAspect = containerW / containerH;

      // How big the image renders within the container (object-fit: contain)
      const renderedW = natAspect > elAspect ? containerW : containerH * natAspect;
      const renderedH = natAspect > elAspect ? containerW / natAspect : containerH;

      // object-position: center top → horizontally centered, top-aligned
      const offsetX = (containerW - renderedW) / 2;
      const offsetY = 0; // top-aligned

      const localX = unzoomedX - offsetX;
      const localY = unzoomedY - offsetY;

      // Ignore clicks outside the actual image area
      if (localX < 0 || localX > renderedW || localY < 0 || localY > renderedH) return;

      const pixel_x = Math.round((localX / renderedW) * natW);
      const pixel_y = Math.round((localY / renderedH) * natH);

      // Clamp to valid range
      if (pixel_x < 0 || pixel_x >= natW || pixel_y < 0 || pixel_y >= natH) return;

      // Store dot position in the transformed (zoomed) image space
      // so the dot appears at the right visual location
      const dotX = localX * zoom + pan.x;
      const dotY = localY * zoom + pan.y;
      dotPosRef.current = { x: dotX, y: dotY };

      setLoading(true);
      executeOperator("@ehofesmann/envi-spectral-viewer/get_spectral_profile", {
        sample_id: sampleId,
        pixel_x,
        pixel_y,
      });
    },
    [sampleId, zoom, pan]
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
        {/* Left: image with zoom/pan support */}
        <LeftCol>
          {loading && !image && <Hint>Loading…</Hint>}
          {image && (
            <ZoomContainer
              ref={zoomContainerRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDoubleClick={handleDoubleClick}
              title={zoom > 1
                ? "Scroll to zoom · Alt+drag to pan · Double-click to reset"
                : "Scroll to zoom · Click a pixel for spectral profile"}
            >
              {/* Zoom level indicator */}
              {zoom > 1 && (
                <ZoomBadge>{zoom.toFixed(1)}×</ZoomBadge>
              )}

              <ImageInner style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
              }}>
                <HsiImage
                  ref={imgRef}
                  src={image}
                  alt="HSI pseudo-RGB"
                  onClick={handleImageClick}
                  draggable={false}
                />
              </ImageInner>

              {/* Pixel dot rendered in ZoomContainer space (not inside the transform) */}
              {dotPosRef.current && spectrum && (
                <PixelDot x={dotPosRef.current.x} y={dotPosRef.current.y} />
              )}
            </ZoomContainer>
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
      <BandControls sampleId={sampleId} spectrum={spectrum} onClear={handleClear} />
    </Container>
  );
}
