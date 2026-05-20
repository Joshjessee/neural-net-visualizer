import { useRef, useEffect } from 'react';

interface TensorMiniVizProps {
  values: number[];
  shape: number[];
  size?: number;
}

export function TensorMiniViz({ values, shape, size = 56 }: TensorMiniVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || values.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    if (shape.length === 1 && shape[0] <= 20) {
      renderBarChart(ctx, values, size);
    } else if (shape.length === 1) {
      renderHeatmapStrip(ctx, values, size);
    } else if (shape.length === 2) {
      renderMatrix(ctx, values, shape, size);
    } else if (shape.length === 3) {
      renderFeatureMaps(ctx, values, shape, size);
    } else {
      renderHeatmapStrip(ctx, values, size);
    }
  }, [values, shape, size]);

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-200 rounded bg-gray-900"
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
    />
  );
}

function renderBarChart(ctx: CanvasRenderingContext2D, values: number[], size: number) {
  const max = Math.max(...values.map(Math.abs), 0.001);
  const barWidth = Math.max(2, (size - 4) / values.length);
  const padding = 2;

  for (let i = 0; i < values.length; i++) {
    const normalized = values[i] / max;
    const barHeight = Math.abs(normalized) * (size / 2 - padding);
    const x = padding + i * barWidth;
    const y = normalized >= 0 ? size / 2 - barHeight : size / 2;

    const hue = normalized >= 0 ? 200 : 10;
    const lightness = 40 + Math.abs(normalized) * 30;
    ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;
    ctx.fillRect(x, y, barWidth - 1, barHeight);
  }
}

function renderHeatmapStrip(ctx: CanvasRenderingContext2D, values: number[], size: number) {
  const max = Math.max(...values.map(Math.abs), 0.001);
  const sampledValues = downsample(values, size);
  const stripHeight = Math.max(8, size / 4);
  const y = (size - stripHeight) / 2;

  for (let i = 0; i < sampledValues.length; i++) {
    const normalized = sampledValues[i] / max;
    ctx.fillStyle = valueToColor(normalized);
    ctx.fillRect(i, y, 1, stripHeight);
  }
}

function renderMatrix(ctx: CanvasRenderingContext2D, values: number[], shape: number[], size: number) {
  const [rows, cols] = shape;
  const max = Math.max(...values.map(Math.abs), 0.001);
  const cellW = size / cols;
  const cellH = size / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= values.length) break;
      const normalized = values[idx] / max;
      ctx.fillStyle = valueToColor(normalized);
      ctx.fillRect(c * cellW, r * cellH, Math.ceil(cellW), Math.ceil(cellH));
    }
  }
}

function renderFeatureMaps(ctx: CanvasRenderingContext2D, values: number[], shape: number[], size: number) {
  const [rows, cols, channels] = shape;
  const numMaps = Math.min(channels, 4);
  const grid = numMaps <= 1 ? 1 : 2;
  const mapSize = Math.floor(size / grid);
  const max = Math.max(...values.map(Math.abs), 0.001);

  for (let ch = 0; ch < numMaps; ch++) {
    const gridRow = Math.floor(ch / grid);
    const gridCol = ch % grid;
    const offsetX = gridCol * mapSize;
    const offsetY = gridRow * mapSize;

    const cellW = mapSize / cols;
    const cellH = mapSize / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = (r * cols + c) * channels + ch;
        if (idx >= values.length) break;
        const normalized = values[idx] / max;
        ctx.fillStyle = valueToColor(normalized);
        ctx.fillRect(
          offsetX + c * cellW,
          offsetY + r * cellH,
          Math.ceil(cellW),
          Math.ceil(cellH),
        );
      }
    }
  }
}

function valueToColor(normalized: number): string {
  const t = (normalized + 1) / 2;
  const r = Math.round(t * 255);
  const b = Math.round((1 - t) * 255);
  const g = Math.round(Math.min(t, 1 - t) * 2 * 100);
  return `rgb(${r}, ${g}, ${b})`;
}

function downsample(values: number[], targetLength: number): number[] {
  if (values.length <= targetLength) return values;
  const step = values.length / targetLength;
  const result: number[] = [];
  for (let i = 0; i < targetLength; i++) {
    result.push(values[Math.floor(i * step)]);
  }
  return result;
}
