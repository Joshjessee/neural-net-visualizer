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
    <header
      className="flex items-center gap-3 px-4 shrink-0 h-14"
      style={{
        backgroundColor: '#161b22',
        borderBottom: '1px solid #30363d',
        boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base select-none"
          style={{
            background: 'linear-gradient(135deg, #1d6fcc 0%, #6741d9 100%)',
            boxShadow: '0 2px 8px rgba(88,166,255,0.25)',
          }}
        >
          🧠
        </div>
        <input
          className="text-sm font-semibold bg-transparent border-none outline-none w-36 border-b border-transparent transition-colors focus:border-b"
          style={{ color: '#f0f6fc', borderBottomColor: '#58a6ff' }}
          value={networkName}
          onChange={e => setNetworkName(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="h-5 w-px shrink-0" style={{ backgroundColor: '#30363d' }} />

      {/* Model type */}
      <label className="flex items-center gap-2 text-xs shrink-0" style={{ color: '#8b949e' }}>
        <span>Type</span>
        <select
          className="text-xs rounded-md px-2 py-1 outline-none transition-colors cursor-pointer"
          style={{
            backgroundColor: '#21262d',
            border: '1px solid #30363d',
            color: '#f0f6fc',
          }}
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

      <div className="h-5 w-px shrink-0" style={{ backgroundColor: '#30363d' }} />

      <ImportExportButtons />

      <div className="h-5 w-px shrink-0" style={{ backgroundColor: '#30363d' }} />

      <ViewToggle />
    </header>
  );
}
