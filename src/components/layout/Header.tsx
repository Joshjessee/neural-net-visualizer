import { useStore } from '../../store';
import { MODEL_TYPE_NAMES } from '../../constants/layerDefaults';
import type { ModelType } from '../../types/network';
import { ViewToggle } from '../shared/ViewToggle';
import { PresetSelector } from '../shared/PresetSelector';
import { ImportExportButtons } from '../shared/ImportExportButtons';
import { UndoRedoButtons } from '../shared/UndoRedoButtons';

export function Header() {
  const { modelType, setModelType, networkName, setNetworkName } = useStore();

  return (
    <header className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 bg-white shrink-0 h-14">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-800">🧠</span>
        <input
          className="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none w-36 focus:border-b focus:border-blue-500"
          value={networkName}
          onChange={e => setNetworkName(e.target.value)}
        />
      </div>

      <div className="h-6 w-px bg-gray-200" />

      <label className="flex items-center gap-2 text-xs text-gray-600">
        Type:
        <select
          className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
          value={modelType}
          onChange={e => setModelType(e.target.value as ModelType)}
        >
          {Object.entries(MODEL_TYPE_NAMES).map(([key, name]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
      </label>

      <PresetSelector />

      <div className="flex-1" />

      <UndoRedoButtons />

      <div className="h-6 w-px bg-gray-200" />

      <ImportExportButtons />

      <div className="h-6 w-px bg-gray-200" />

      <ViewToggle />
    </header>
  );
}
