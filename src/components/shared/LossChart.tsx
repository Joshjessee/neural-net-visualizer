interface LossChartProps {
  data: number[];
  label: string;
  color: string;
  width?: number;
  height?: number;
}

export function LossChart({ data, label, color, width = 240, height = 80 }: LossChartProps) {
  if (data.length === 0) return null;

  const padding = { top: 8, right: 8, bottom: 16, left: 32 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const points = data.map((val, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + (1 - (val - minVal) / range) * chartH;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  // Grid lines (3 horizontal)
  const gridLines = [0, 0.5, 1].map(frac => {
    const y = padding.top + frac * chartH;
    const val = maxVal - frac * range;
    return { y, label: val.toFixed(val < 0.01 ? 4 : val < 1 ? 3 : 1) };
  });

  return (
    <div>
      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
      <svg width={width} height={height} className="mt-0.5">
        {/* Grid lines */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={line.y}
              x2={width - padding.right}
              y2={line.y}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
            <text
              x={padding.left - 3}
              y={line.y + 3}
              textAnchor="end"
              fontSize={7}
              fill="#94a3b8"
            >
              {line.label}
            </text>
          </g>
        ))}

        {/* Data line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />

        {/* Current value dot */}
        {data.length > 0 && (
          <circle
            cx={padding.left + ((data.length - 1) / Math.max(data.length - 1, 1)) * chartW}
            cy={padding.top + (1 - (data[data.length - 1] - minVal) / range) * chartH}
            r={2.5}
            fill={color}
          />
        )}

        {/* Epoch label */}
        <text
          x={width / 2}
          y={height - 2}
          textAnchor="middle"
          fontSize={7}
          fill="#94a3b8"
        >
          Epoch {data.length}
        </text>
      </svg>
    </div>
  );
}
