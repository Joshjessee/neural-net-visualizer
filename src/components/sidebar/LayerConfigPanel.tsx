import { useStore } from '../../store';
import type { ActivationFn, LayerConfig } from '../../types/network';
import { ACTIVATIONS } from '../../constants/activations';
import { ActivationViz } from './ActivationViz';
import { LAYER_COLORS } from '../../constants/colors';

export function LayerConfigPanel() {
  const { layers, selectedLayerId, updateLayer, removeLayer, selectLayer } = useStore();
  const layer = layers.find(l => l.id === selectedLayerId);

  if (!layer) {
    return (
      <div className="p-4 text-xs text-gray-400 text-center">
        Select a layer to configure
      </div>
    );
  }

  const colors = LAYER_COLORS[layer.type];

  const update = (key: keyof LayerConfig, value: unknown) => {
    updateLayer(layer.id, { [key]: value });
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-700">Configure Layer</h3>
        <button
          onClick={() => { removeLayer(layer.id); selectLayer(null); }}
          className="text-[10px] text-red-500 hover:text-red-700 px-1"
        >
          Remove
        </button>
      </div>

      <div
        className="p-2 rounded border text-xs"
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        <span style={{ color: colors.text }} className="font-medium">{layer.type}</span>
      </div>

      {/* Name */}
      <Field label="Name">
        <input
          className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
          value={layer.name}
          onChange={e => update('name', e.target.value)}
        />
      </Field>

      {/* Units (Dense, LSTM, GRU, FeedForward, Output) */}
      {(layer.type === 'dense' || layer.type === 'lstm' || layer.type === 'gru' || layer.type === 'feedForward' || layer.type === 'output') && (
        <Field label="Units">
          <input
            type="number"
            min={1}
            className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
            value={layer.units || 0}
            onChange={e => update('units', parseInt(e.target.value) || 1)}
          />
        </Field>
      )}

      {/* Filters (Conv2D) */}
      {layer.type === 'conv2d' && (
        <>
          <Field label="Filters">
            <input
              type="number"
              min={1}
              className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
              value={layer.filters || 0}
              onChange={e => update('filters', parseInt(e.target.value) || 1)}
            />
          </Field>
          <Field label="Kernel Size">
            <div className="flex gap-1">
              <input
                type="number"
                min={1}
                className="w-1/2 text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                value={layer.kernelSize?.[0] || 3}
                onChange={e => update('kernelSize', [parseInt(e.target.value) || 1, layer.kernelSize?.[1] || 3])}
              />
              <input
                type="number"
                min={1}
                className="w-1/2 text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                value={layer.kernelSize?.[1] || 3}
                onChange={e => update('kernelSize', [layer.kernelSize?.[0] || 3, parseInt(e.target.value) || 1])}
              />
            </div>
          </Field>
        </>
      )}

      {/* Pool Size */}
      {layer.type === 'maxPool2d' && (
        <Field label="Pool Size">
          <div className="flex gap-1">
            <input
              type="number"
              min={1}
              className="w-1/2 text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
              value={layer.poolSize?.[0] || 2}
              onChange={e => update('poolSize', [parseInt(e.target.value) || 1, layer.poolSize?.[1] || 2])}
            />
            <input
              type="number"
              min={1}
              className="w-1/2 text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
              value={layer.poolSize?.[1] || 2}
              onChange={e => update('poolSize', [layer.poolSize?.[0] || 2, parseInt(e.target.value) || 1])}
            />
          </div>
        </Field>
      )}

      {/* Dropout Rate */}
      {layer.type === 'dropout' && (
        <Field label="Rate">
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
            value={layer.rate || 0.5}
            onChange={e => update('rate', parseFloat(e.target.value))}
          />
        </Field>
      )}

      {/* Embedding */}
      {layer.type === 'embedding' && (
        <>
          <Field label="Vocab Size">
            <input
              type="number"
              min={1}
              className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
              value={layer.vocabSize || 10000}
              onChange={e => update('vocabSize', parseInt(e.target.value) || 1)}
            />
          </Field>
          <Field label="Embedding Dim">
            <input
              type="number"
              min={1}
              className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
              value={layer.embeddingDim || 128}
              onChange={e => update('embeddingDim', parseInt(e.target.value) || 1)}
            />
          </Field>
        </>
      )}

      {/* Attention heads */}
      {layer.type === 'multiHeadAttention' && (
        <>
          <Field label="Num Heads">
            <input
              type="number"
              min={1}
              className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
              value={layer.numHeads || 8}
              onChange={e => update('numHeads', parseInt(e.target.value) || 1)}
            />
          </Field>
          <Field label="Key Dim">
            <input
              type="number"
              min={1}
              className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
              value={layer.keyDim || 64}
              onChange={e => update('keyDim', parseInt(e.target.value) || 1)}
            />
          </Field>
        </>
      )}

      {/* Input Shape */}
      {layer.type === 'input' && (
        <Field label="Input Shape">
          <input
            className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
            value={layer.inputShape?.join(', ') || '784'}
            onChange={e => {
              const shape = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
              if (shape.length > 0) update('inputShape', shape);
            }}
          />
          <p className="text-[10px] text-gray-400 mt-0.5">Comma-separated dimensions</p>
        </Field>
      )}

      {/* Return Sequences */}
      {(layer.type === 'lstm' || layer.type === 'gru') && (
        <Field label="Return Sequences">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={layer.returnSequences || false}
              onChange={e => update('returnSequences', e.target.checked)}
            />
            <span>Yes</span>
          </label>
        </Field>
      )}

      {/* Activation Function */}
      {layer.activation !== undefined && (
        <div className="space-y-1">
          <Field label="Activation">
            <select
              className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
              value={layer.activation}
              onChange={e => update('activation', e.target.value as ActivationFn)}
            >
              {Object.entries(ACTIVATIONS).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </Field>
          <div className="flex items-center gap-2">
            <ActivationViz activation={layer.activation} />
            <p className="text-[10px] text-gray-500 flex-1">
              {ACTIVATIONS[layer.activation]?.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
