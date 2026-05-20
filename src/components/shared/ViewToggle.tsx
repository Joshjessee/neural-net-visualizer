import { useStore } from '../../store';

export function ViewToggle() {
  const { viewMode, setViewMode } = useStore();

  return (
    <div
      className="flex rounded-lg p-0.5"
      style={{ backgroundColor: '#21262d', border: '1px solid #30363d' }}
    >
      {(['2d', '3d'] as const).map(mode => {
        const isActive = viewMode === mode;
        return (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className="px-3 py-1 text-xs font-semibold rounded-md transition-all select-none"
            style={{
              backgroundColor: isActive ? '#161b22' : 'transparent',
              color: isActive ? '#f0f6fc' : '#8b949e',
              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
              border: isActive ? '1px solid #30363d' : '1px solid transparent',
            }}
          >
            {mode.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
