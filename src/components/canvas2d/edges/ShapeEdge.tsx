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

  return (
    <>
      <BaseEdge path={edgePath} style={style} markerEnd={markerEnd} />
      {shape && (
        <foreignObject
          x={labelX - 40}
          y={labelY - 10}
          width={80}
          height={20}
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
                fontFamily: 'monospace',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1px 6px',
                whiteSpace: 'nowrap',
                lineHeight: '14px',
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
