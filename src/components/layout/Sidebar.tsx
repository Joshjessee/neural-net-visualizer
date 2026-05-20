import { useStore } from '../../store';
import type { SidebarPanel } from '../../types/ui';
import { LayerPalette } from '../sidebar/LayerPalette';
import { LayerConfigPanel } from '../sidebar/LayerConfigPanel';
import { NetworkSummary } from '../sidebar/NetworkSummary';
import { InferencePanel } from '../sidebar/InferencePanel';
import { TrainingPanel } from '../sidebar/TrainingPanel';

const TABS: { id: SidebarPanel; label: string; icon: string }[] = [
  { id: 'layers',   label: 'Layers',   icon: '◈' },
  { id: 'config',   label: 'Config',   icon: '⚙' },
  { id: 'inference',label: 'Infer',    icon: '⚡' },
  { id: 'training', label: 'Train',    icon: '↗' },
];

export function Sidebar() {
  const { sidebarOpen, activePanel, setActivePanel } = useStore();

  if (!sidebarOpen) return null;

  return (
    <aside
      className="w-80 flex flex-col shrink-0 overflow-hidden"
      style={{ backgroundColor: '#161b22', borderRight: '1px solid #30363d' }}
    >
      {/* Tab bar */}
      <div className="flex shrink-0" style={{ borderBottom: '1px solid #30363d' }}>
        {TABS.map(tab => {
          const isActive = activePanel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              className="flex-1 py-2.5 text-xs font-medium transition-all relative select-none"
              style={{
                color: isActive ? '#f0f6fc' : '#8b949e',
                backgroundColor: isActive ? '#21262d' : 'transparent',
              }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span style={{ fontSize: '11px', opacity: 0.9 }}>{tab.icon}</span>
                {tab.label}
              </span>
              {isActive && (
                <div
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #1d6fcc, #6741d9)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {activePanel === 'layers' && (
          <>
            <LayerPalette />
            <div style={{ borderTop: '1px solid #21262d' }}>
              <NetworkSummary />
            </div>
          </>
        )}
        {activePanel === 'config'    && <LayerConfigPanel />}
        {activePanel === 'inference' && <InferencePanel />}
        {activePanel === 'training'  && <TrainingPanel />}
      </div>
    </aside>
  );
}
