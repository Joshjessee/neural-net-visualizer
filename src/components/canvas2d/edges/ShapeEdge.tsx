import { BaseEdge, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';

export interface ShapeEdgeData {
  shape: string;
  [key: string]: unknown;
}

type ShapeEdgeType = Edge<ShapeEdgeData>;

export function ShapeEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
  markerEnd,
}: EdgeProps<ShapeEdgeType>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const shape = data?.shape;

  // Merge in dark stroke if not already provided
  const edgeStyle = {
    stroke: '#2d4a6b',
    strokeWidth: 2,
    ...style,
  };

  return (
    <>
      <BaseEdge path={edgePath} style={edgeStyle} markerEnd={markerEnd} />
      {shape && (
        <foreignObject
          x={labelX - 40}
          y={labelY - 11}
          width={80}
          height={22}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <span
              style={{
                fontSize: '9px',
                fontFamily: '"SF Mono", "Fira Code", monospace',
                color: '#8b949e',
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '2px 6px',
                whiteSpace: 'nowrap',
                lineHeight: '14px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              {shape}
            </span>
          </div>
        </foreignObject>
      )}
    </>
  );
}
