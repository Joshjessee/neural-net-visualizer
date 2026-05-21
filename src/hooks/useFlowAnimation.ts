import { useEffect, useRef } from 'react';
import { useStore } from '../store';

const STEP_DELAY_MS = 800;

export function useFlowAnimation() {
  const {
    isFlowAnimating,
    flowActiveLayerIndex,
    advanceFlow,
    stopFlowAnimation,
    layers,
  } = useStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isFlowAnimating) return;

    if (flowActiveLayerIndex >= layers.length) {
      stopFlowAnimation();
      return;
    }

    timerRef.current = setTimeout(() => {
      advanceFlow();
    }, STEP_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isFlowAnimating, flowActiveLayerIndex, layers.length, advanceFlow, stopFlowAnimation]);
}
