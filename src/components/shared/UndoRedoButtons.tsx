import { useUndoRedo } from '../../hooks/useUndoRedo';

export function UndoRedoButtons() {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={undo}
        disabled={!canUndo}
        className="p-1.5 text-gray-500 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Undo (Ctrl+Z)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" />
        </svg>
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="p-1.5 text-gray-500 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Redo (Ctrl+Y)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4" />
        </svg>
      </button>
    </div>
  );
}
