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
  const pad = 5;

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
    <svg
      width={width}
      height={height}
      className="rounded-lg shrink-0"
      style={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }}
    >
      {/* Zero axes */}
      <line x1={pad} y1={zeroY} x2={width - pad} y2={zeroY} stroke="#21262d" strokeWidth={1} />
      <line x1={zeroX} y1={pad} x2={zeroX} y2={height - pad} stroke="#21262d" strokeWidth={1} />
      {/* Function curve with subtle glow */}
      <path d={pathData} fill="none" stroke="#1d6fcc" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
      <path d={pathData} fill="none" stroke="#58a6ff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
