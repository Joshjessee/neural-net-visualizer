import { useEffect, useCallback, useSyncExternalStore } from 'react';
import { useStore } from '../store';
import type { StoreApi } from 'zustand';
import type { TemporalState } from 'zundo';

type TrackedState = Pick<
  ReturnType<typeof useStore.getState>,
  'layers' | 'connections' | 'modelType' | 'networkName' | 'presetId'
>;

type TemporalStore = StoreApi<TemporalState<TrackedState>>;

function getTemporalStore(): TemporalStore {
  return (useStore as unknown as { temporal: TemporalStore }).temporal;
}

function useTemporalSelector<T>(selector: (state: TemporalState<TrackedState>) => T): T {
  const store = getTemporalStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
  );
}

export function useUndoRedo() {
  const store = getTemporalStore();

  const undo = useCallback(() => {
    store.getState().undo();
  }, [store]);

  const redo = useCallback(() => {
    store.getState().redo();
  }, [store]);

  const canUndo = useTemporalSelector(s => s.pastStates.length > 0);
  const canRedo = useTemporalSelector(s => s.futureStates.length > 0);

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip when focus is in an input or textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return { undo, redo, canUndo, canRedo };
}
