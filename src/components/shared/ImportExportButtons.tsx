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

    // Reset so the same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-1 relative">
      <button
        onClick={handleExport}
        disabled={layers.length === 0}
        className="px-2 py-1 text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Export network as JSON"
      >
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </span>
      </button>

      <button
        onClick={handleImportClick}
        className="px-2 py-1 text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
        title="Import network from JSON"
      >
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {importError && (
        <div className="absolute top-full right-0 mt-1 px-2 py-1 text-[10px] text-red-600 bg-red-50 border border-red-200 rounded whitespace-nowrap z-50">
          {importError}
        </div>
      )}
    </div>
  );
}
