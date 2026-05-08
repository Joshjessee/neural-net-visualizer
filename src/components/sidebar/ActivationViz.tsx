import type { ActivationFn } from '../../types/network';
import { ACTIVATIONS } from '../../constants/activations';

interface Props {
  activation: ActivationFn;
  width?: number;
  height?: number;
}

export function ActivationViz({ activation, width = 80, height = 50 }: Props) {
  const info = ACTIVATIONS[activation];
  if (!info) return null;

  const { points } = info;
  const xMin = points[0].x;
  const xMax = points[points.length - 1].x;
  const yValues = points.map(p => p.y);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const yRange = yMax - yMin || 1;
  const pad = 4;

  const toSvg = (x: number, y: number) => ({
    sx: pad + ((x - xMin) / (xMax - xMin)) * (width - pad * 2),
    sy: height - pad - ((y - yMin) / yRange) * (height - pad * 2),
  });

  const pathData = points
    .map((p, i) => {
      const { sx, sy } = toSvg(p.x, p.y);
      return `${i === 0 ? 'M' : 'L'} ${sx} ${sy}`;
    })
    .join(' ');

  const zeroY = toSvg(0, 0).sy;
  const zeroX = toSvg(0, 0).sx;

  return (
    <svg width={width} height={height} className="bg-gray-50 rounded border border-gray-200">
      {/* Axes */}
      <line x1={pad} y1={zeroY} x2={width - pad} y2={zeroY} stroke="#ddd" strokeWidth={0.5} />
      <line x1={zeroX} y1={pad} x2={zeroX} y2={height - pad} stroke="#ddd" strokeWidth={0.5} />
      {/* Function curve */}
      <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
    </svg>
  );
}
