import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from '../../store';
import { LAYER_COLORS } from '../../constants/colors';
import type { LayerConfig } from '../../types/network';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { propagateShapes, formatShape } from '../../utils/shapePropagator';
import { ShapeLabel } from './ShapeLabel';

const LAYER_SPACING_Z = 4;
const MAX_NEURONS_DISPLAY = 36;
const MAX_CONNECTIONS_PER_PAIR = 8;

function getLayerPositions(layer: LayerConfig, index: number, total: number) {
  const neuronCount = getNeuronCount(layer);
  const displayCount = Math.min(neuronCount, MAX_NEURONS_DISPLAY);
  const zPos = -(index - (total - 1) / 2) * LAYER_SPACING_Z;

  const positions: [number, number, number][] = [];
  const cols = Math.ceil(Math.sqrt(displayCount));
  const rows = Math.ceil(displayCount / cols);
  const spacing = 0.5;

  for (let i = 0; i < displayCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = (col - (cols - 1) / 2) * spacing;
    const y = (row - (rows - 1) / 2) * spacing;
    positions.push([x, y, zPos]);
  }

  return { positions, displayCount, neuronCount, zPos };
}

function NeuronLayer({ layer, index, total, isSelected, activationValues }: {
  layer: LayerConfig;
  index: number;
  total: number;
  isSelected: boolean;
  activationValues: number[] | null;
}) {
  const selectLayer = useStore(s => s.selectLayer);
  const setActivePanel = useStore(s => s.setActivePanel);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const { positions, displayCount, neuronCount } = getLayerPositions(layer, index, total);
  const colors = LAYER_COLORS[layer.type];
  const baseColor = new THREE.Color(colors.border);

  // Animate neuron glow based on activations
  useFrame(() => {
    if (!activationValues || activationValues.length === 0) return;

    const maxVal = Math.max(...activationValues.map(Math.abs), 0.001);

    for (let i = 0; i < meshRefs.current.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      const mat = mesh.material as THREE.MeshStandardMaterial;
      const actIdx = i % activationValues.length;
      const normalizedVal = Math.abs(activationValues[actIdx]) / maxVal;

      // Lerp from base color to hot color based on activation
      const hotColor = new THREE.Color('#ff4400');
      const coolColor = new THREE.Color(colors.border);
      mat.color.copy(coolColor).lerp(hotColor, normalizedVal * 0.8);
      mat.emissive.copy(hotColor);
      mat.emissiveIntensity = normalizedVal * 0.6;
    }
  });

  // Reset colors when activations are cleared
  useEffect(() => {
    if (activationValues) return;
    for (const mesh of meshRefs.current) {
      if (!mesh) continue;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.copy(baseColor);
      mat.emissive.set('#000000');
      mat.emissiveIntensity = 0;
    }
  }, [activationValues, baseColor]);

  const labelY = -getLayerHeight(displayCount) / 2 - 0.5;
  const label = neuronCount > MAX_NEURONS_DISPLAY
    ? `${layer.name} (${neuronCount})`
    : layer.name;
  const zPos = positions[0]?.[2] ?? 0;

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh
          key={i}
          ref={el => { meshRefs.current[i] = el; }}
          position={pos}
          onClick={e => { e.stopPropagation(); selectLayer(layer.id); setActivePanel('config'); }}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={isSelected ? baseColor : new THREE.Color('#000')}
            emissiveIntensity={isSelected ? 0.3 : 0}
          />
        </mesh>
      ))}

      <mesh position={[0, labelY, zPos]}>
        <planeGeometry args={[label.length * 0.12, 0.25]} />
        <meshBasicMaterial color={colors.bg} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function NeuronConnections({ layers, flowProgress }: {
  layers: LayerConfig[];
  flowProgress: number; // -1 = no flow, 0..layers.length = flowing
}) {
  const connections = useStore(s => s.connections);

  const { geometry, skipGeometry, flowGeometry } = useMemo(() => {
    const points: number[] = [];
    const skipPts: number[] = [];
    const flowPts: number[] = [];
    const total = layers.length;

    for (const conn of connections) {
      const srcIdx = layers.findIndex(l => l.id === conn.sourceLayerId);
      const tgtIdx = layers.findIndex(l => l.id === conn.targetLayerId);
      if (srcIdx === -1 || tgtIdx === -1) continue;

      const srcLayout = getLayerPositions(layers[srcIdx], srcIdx, total);
      const tgtLayout = getLayerPositions(layers[tgtIdx], tgtIdx, total);

      // Sample connections between neurons
      const srcCount = srcLayout.positions.length;
      const tgtCount = tgtLayout.positions.length;
      const srcStep = Math.max(1, Math.ceil(srcCount / MAX_CONNECTIONS_PER_PAIR));
      const tgtStep = Math.max(1, Math.ceil(tgtCount / MAX_CONNECTIONS_PER_PAIR));

      const isFlowing = flowProgress >= 0 && srcIdx <= flowProgress && tgtIdx <= flowProgress + 1;
      const targetArr = conn.isSkipConnection ? skipPts : (isFlowing ? flowPts : points);

      for (let si = 0; si < srcCount; si += srcStep) {
        for (let ti = 0; ti < tgtCount; ti += tgtStep) {
          const sp = srcLayout.positions[si];
          const tp = tgtLayout.positions[ti];
          targetArr.push(sp[0], sp[1], sp[2], tp[0], tp[1], tp[2]);
        }
      }
    }

    const toGeo = (arr: number[]) => {
      if (arr.length === 0) return null;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      return geo;
    };

    return {
      geometry: toGeo(points),
      skipGeometry: toGeo(skipPts),
      flowGeometry: toGeo(flowPts),
    };
  }, [layers, connections, flowProgress]);

  return (
    <>
      {geometry && (
        <lineSegments geometry={geometry}>
          <lineBasicMaterial color="#94a3b8" opacity={0.3} transparent />
        </lineSegments>
      )}
      {skipGeometry && (
        <lineSegments geometry={skipGeometry}>
          <lineBasicMaterial color="#ef4444" opacity={0.25} transparent />
        </lineSegments>
      )}
      {flowGeometry && (
        <lineSegments geometry={flowGeometry}>
          <lineBasicMaterial color="#f97316" opacity={0.6} transparent />
        </lineSegments>
      )}
    </>
  );
}

function FlowPulse({ layers, flowLayerIndex }: {
  layers: LayerConfig[];
  flowLayerIndex: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const total = layers.length;

  useFrame(({ clock }) => {
    if (!meshRef.current || flowLayerIndex < 0 || flowLayerIndex >= total) return;

    const zPos = -(flowLayerIndex - (total - 1) / 2) * LAYER_SPACING_Z;
    meshRef.current.position.set(0, 0, zPos);

    const pulse = Math.sin(clock.getElapsedTime() * 6) * 0.5 + 0.5;
    const scale = 1.5 + pulse * 0.5;
    meshRef.current.scale.set(scale, scale, 0.1);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + pulse * 0.15;
  });

  if (flowLayerIndex < 0) return null;

  return (
    <mesh ref={meshRef}>
      <ringGeometry args={[1.5, 2.5, 32]} />
      <meshBasicMaterial color="#f97316" transparent opacity={0.2} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function Canvas3D() {
  const { layers, selectedLayerId, activations, isRunningInference, isTraining } = useStore();
  const [flowLayerIndex, setFlowLayerIndex] = useState(-1);
  const [flowDone, setFlowDone] = useState(false);

  // Animate flow through layers during inference or training
  useEffect(() => {
    // During training, show continuous flow animation
    if (isTraining) {
      let idx = 0;
      setFlowDone(false);
      setFlowLayerIndex(0);
      const interval = setInterval(() => {
        idx = (idx + 1) % layers.length;
        setFlowLayerIndex(idx);
      }, 400);
      return () => clearInterval(interval);
    }

    if (!isRunningInference && Object.keys(activations).length === 0) {
      setFlowLayerIndex(-1);
      setFlowDone(false);
      return;
    }

    if (Object.keys(activations).length > 0) {
      let idx = 0;
      setFlowDone(false);
      setFlowLayerIndex(0);
      const interval = setInterval(() => {
        idx++;
        if (idx >= layers.length) {
          clearInterval(interval);
          // Keep neurons lit after flow completes
          setFlowDone(true);
        } else {
          setFlowLayerIndex(idx);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [activations, isRunningInference, isTraining, layers.length]);

  // Map store activations to per-layer arrays by index
  const layerActivations = useMemo(() => {
    if (Object.keys(activations).length === 0) return layers.map(() => null);

    return layers.map((_layer, idx) => {
      // activations are keyed by TF.js layer name (e.g., "dense_Dense1")
      // Try matching by index in the model (skip input layer)
      const keys = Object.keys(activations);
      const modelIdx = idx - 1; // input layer has no activation
      if (modelIdx < 0 || modelIdx >= keys.length) return null;
      const entry = activations[keys[modelIdx]];
      return entry?.values ?? null;
    });
  }, [layers, activations]);

  const shapes = useMemo(() => propagateShapes(layers), [layers]);

  // Build shape labels positioned between consecutive layers
  const shapeLabels = useMemo(() => {
    const labels: { key: string; position: [number, number, number]; shape: string }[] = [];
    const total = layers.length;
    for (let i = 0; i < total - 1; i++) {
      const targetLayer = layers[i + 1];
      const shapeInfo = shapes.get(targetLayer.id);
      if (shapeInfo?.inputShape) {
        const z1 = -(i - (total - 1) / 2) * LAYER_SPACING_Z;
        const z2 = -(i + 1 - (total - 1) / 2) * LAYER_SPACING_Z;
        labels.push({
          key: `shape-${i}`,
          position: [2.5, 0, (z1 + z2) / 2],
          shape: formatShape(shapeInfo.inputShape),
        });
      }
    }
    return labels;
  }, [layers, shapes]);

  if (layers.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Add layers to see the 3D visualization
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{
          position: [8, 6, layers.length * 2 + 8],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: '#f8fafc' }}
      >
        <color attach="background" args={['#f8fafc']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />

        {layers.map((layer, index) => (
          <NeuronLayer
            key={layer.id}
            layer={layer}
            index={index}
            total={layers.length}
            isSelected={layer.id === selectedLayerId}
            activationValues={
              flowDone || flowLayerIndex >= index ? layerActivations[index] : null
            }
          />
        ))}

        <NeuronConnections layers={layers} flowProgress={flowDone ? layers.length : flowLayerIndex} />
        <FlowPulse layers={layers} flowLayerIndex={flowDone ? -1 : flowLayerIndex} />

        {shapeLabels.map(({ key, position, shape }) => (
          <ShapeLabel key={key} position={position} shape={shape} />
        ))}

        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={2}
          maxDistance={50}
        />

        <gridHelper args={[20, 20, '#e2e8f0', '#f1f5f9']} rotation={[Math.PI / 2, 0, 0]} />
      </Canvas>
    </div>
  );
}

function getNeuronCount(layer: LayerConfig): number {
  switch (layer.type) {
    case 'dense':
    case 'output':
    case 'lstm':
    case 'gru':
    case 'feedForward':
      return layer.units || 1;
    case 'conv2d':
      return layer.filters || 1;
    case 'input':
      return Math.min(layer.inputShape?.reduce((a, b) => a * b, 1) || 1, MAX_NEURONS_DISPLAY);
    case 'embedding':
      return layer.embeddingDim || 1;
    case 'multiHeadAttention':
      return (layer.numHeads || 8) * (layer.keyDim || 8);
    default:
      return 8;
  }
}

function getLayerHeight(count: number): number {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return rows * 0.5;
}
