import { useStore } from '../../store';
import type { SidebarPanel } from '../../types/ui';
import { LayerPalette } from '../sidebar/LayerPalette';
import { LayerConfigPanel } from '../sidebar/LayerConfigPanel';
import { NetworkSummary } from '../sidebar/NetworkSummary';
import { InferencePanel } from '../sidebar/InferencePanel';
import { TrainingPanel } from '../sidebar/TrainingPanel';

const TABS: { id: SidebarPanel; label: string }[] = [
  { id: 'layers', label: 'Layers' },
  { id: 'config', label: 'Config' },
  { id: 'inference', label: 'Inference' },
  { id: 'training', label: 'Training' },
];

export function Sidebar() {
  const { sidebarOpen, activePanel, setActivePanel } = useStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-80 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden">
      <div className="flex border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activePanel === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activePanel === 'layers' && (
          <>
            <LayerPalette />
            <div className="border-t border-gray-100">
              <NetworkSummary />
            </div>
          </>
        )}
        {activePanel === 'config' && <LayerConfigPanel />}
        {activePanel === 'inference' && <InferencePanel />}
        {activePanel === 'training' && <TrainingPanel />}
      </div>
    </aside>
  );
}
