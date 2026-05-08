import { Html } from '@react-three/drei';

interface ShapeLabelProps {
  position: [number, number, number];
  shape: string;
}

export function ShapeLabel({ position, shape }: ShapeLabelProps) {
  return (
    <Html position={position} center sprite>
      <div
        style={{
          fontSize: '9px',
          fontFamily: 'monospace',
          color: '#64748b',
          backgroundColor: 'rgba(248, 250, 252, 0.9)',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1px 6px',
          whiteSpace: 'nowrap',
          lineHeight: '14px',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {shape}
      </div>
    </Html>
  );
}
