interface LossChartProps {
  data: number[];
  label: string;
  color: string;
  width?: number;
  height?: number;
}

export function LossChart({ data, label, color, width = 248, height = 80 }: LossChartProps) {
  if (data.length === 0) return null;

  const padding = { top: 8, right: 8, bottom: 16, left: 34 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const toX = (i: number) => padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const toY = (val: number) => padding.top + (1 - (val - minVal) / range) * chartH;

  const points = data.map((val, i) => `${toX(i)},${toY(val)}`);
  const pathD = `M ${points.join(' L ')}`;

  // Area fill path
  const areaD = `M ${toX(0)},${toY(data[0])} L ${points.join(' L ')} L ${toX(data.length - 1)},${padding.top + chartH} L ${toX(0)},${padding.top + chartH} Z`;

  const gridLines = [0, 0.5, 1].map(frac => {
    const y = padding.top + frac * chartH;
    const val = maxVal - frac * range;
    return { y, label: val.toFixed(val < 0.01 ? 4 : val < 1 ? 3 : 1) };
  });

  const lastX = toX(data.length - 1);
  const lastY = toY(data[data.length - 1]);

  const gradId = `grad-${label.replace(/\s/g, '')}`;

  return (
    <div>
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6e7681' }}>
        {label}
      </span>
      <svg width={width} height={height} className="mt-1 rounded-lg overflow-hidden"
        style={{ backgroundColor: '#0d1117', border: '1px solid #21262d' }}>

        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={line.y}
              x2={width - padding.right}
              y2={line.y}
              stroke="#21262d"
              strokeWidth={1}
            />
            <text
              x={padding.left - 4}
              y={line.y + 3}
              textAnchor="end"
              fontSize={7}
              fill="#484f58"
              fontFamily="monospace"
            >
              {line.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        {data.length > 1 && (
          <path d={areaD} fill={`url(#${gradId})`} />
        )}

        {/* Data line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />

        {/* Glow effect on the line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" opacity={0.15} />

        {/* Current value dot */}
        <circle cx={lastX} cy={lastY} r={3} fill={color} />
        <circle cx={lastX} cy={lastY} r={5} fill={color} opacity={0.2} />

        {/* Epoch label */}
        <text
          x={width / 2}
          y={height - 3}
          textAnchor="middle"
          fontSize={7}
          fill="#484f58"
          fontFamily="monospace"
        >
          epoch {data.length}
        </text>
      </svg>
    </div>
  );
}
