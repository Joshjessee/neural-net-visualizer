import { useStore } from '../../store';

export function ViewToggle() {
  const { viewMode, setViewMode } = useStore();

  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5">
      <button
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          viewMode === '2d'
            ? 'bg-white text-gray-800 shadow-sm font-medium'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setViewMode('2d')}
      >
        2D
      </button>
      <button
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          viewMode === '3d'
            ? 'bg-white text-gray-800 shadow-sm font-medium'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setViewMode('3d')}
      >
        3D
      </button>
    </div>
  );
}
