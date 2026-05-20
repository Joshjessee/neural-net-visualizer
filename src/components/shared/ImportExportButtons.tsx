import { useRef, useState } from 'react';
import { useStore } from '../../store';
import { exportToJson, importFromJson } from '../../utils/persistence';

export function ImportExportButtons() {
  const { layers, connections, modelType, networkName, presetId, loadNetwork } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    exportToJson({ layers, connections, modelType, networkName, presetId });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImportError(null);
      const data = await importFromJson(file);
      loadNetwork(data.layers, data.connections, data.modelType, data.networkName, data.presetId ?? undefined);
    } catch (err) {
      setImportError((err as Error).message);
      setTimeout(() => setImportError(null), 4000);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const btnBase = {
    backgroundColor: '#21262d',
    border: '1px solid #30363d',
    color: '#8b949e',
    transition: 'all 0.15s ease',
  };

  return (
    <div className="flex items-center gap-1 relative">
      <button
        onClick={handleExport}
        disabled={layers.length === 0}
        className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
        style={btnBase}
        onMouseEnter={e => !layers.length || ((e.currentTarget as HTMLButtonElement).style.color = '#f0f6fc')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#8b949e')}
        title="Export network as JSON"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>

      <button
        onClick={handleImportClick}
        className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md"
        style={btnBase}
        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#f0f6fc')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#8b949e')}
        title="Import network from JSON"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {importError && (
        <div
          className="absolute top-full right-0 mt-1.5 px-2.5 py-1.5 text-[10px] rounded-lg whitespace-nowrap z-50"
          style={{
            color: '#f85149',
            backgroundColor: '#1e0c0c',
            border: '1px solid #991b1b',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          ✕ {importError}
        </div>
      )}
    </div>
  );
}
