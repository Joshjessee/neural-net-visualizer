import { useStore } from '../../store';

export function ExperienceModeToggle() {
  const { experienceMode, setExperienceMode } = useStore();

  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5">
      <button
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          experienceMode === 'beginner'
            ? 'bg-white text-gray-800 shadow-sm font-medium'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setExperienceMode('beginner')}
      >
        Beginner
      </button>
      <button
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          experienceMode === 'advanced'
            ? 'bg-white text-gray-800 shadow-sm font-medium'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setExperienceMode('advanced')}
      >
        Advanced
      </button>
    </div>
  );
}
