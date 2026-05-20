import { useStore } from '../../store';
import type { ActivationFn, LayerConfig } from '../../types/network';
import { ACTIVATIONS } from '../../constants/activations';
import { ActivationViz } from './ActivationViz';
import { LAYER_COLORS } from '../../constants/colors';
import { BEGINNER_VISIBLE_PARAMS, BEGINNER_LABELS, LAYER_DESCRIPTIONS } from '../../constants/beginnerConfig';

export function LayerConfigPanel() {
  const { layers, selectedLayerId, updateLayer, removeLayer, selectLayer, experienceMode } = useStore();
  const layer = layers.find(l => l.id === selectedLayerId);
  const isBeginner = experienceMode === 'beginner';

  if (!layer) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <span style={{ fontSize: '24px' }}>◈</span>
        <p className="text-xs text-center" style={{ color: '#484f58' }}>
          Select a layer to configure it
        </p>
      </div>
    );
  }

  const colors = LAYER_COLORS[layer.type];

  const update = (key: keyof LayerConfig, value: unknown) => {
    updateLayer(layer.id, { [key]: value });
  };

  const showParam = (param: string) =>
    !isBeginner || BEGINNER_VISIBLE_PARAMS[layer.type]?.includes(param);

  const label = (param: string, fallback: string) =>
    isBeginner ? (BEGINNER_LABELS[param] || fallback) : fallback;

  return (
    <div className="p-3 space-y-3">
      {/* Layer header */}
      <div className="flex items-center justify-between">
        <div
          className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg"
          style={{
            backgroundColor: colors.bg,
            border: `1.5px solid ${colors.border}`,
          }}
        >
          <span className="font-semibold text-xs" style={{ color: colors.text }}>
            {layer.type}
          </span>
        </div>
        <button
          onClick={() => { removeLayer(layer.id); selectLayer(null); }}
          className="ml-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors"
          style={{
            color: '#f85149',
            backgroundColor: 'rgba(248,81,73,0.1)',
            border: '1px solid rgba(248,81,73,0.2)',
          }}
        >
          Remove
        </button>
      </div>

      {/* Beginner description */}
      {isBeginner && LAYER_DESCRIPTIONS[layer.type] && (
        <p className="text-[10px] leading-relaxed" style={{ color: '#8b949e' }}>
          {LAYER_DESCRIPTIONS[layer.type]}
        </p>
      )}

      {/* Name */}
      {!isBeginner && (
        <Field label="Name">
          <input
            className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none transition-colors"
            style={{
              backgroundColor: '#21262d',
              border: '1px solid #30363d',
              color: '#f0f6fc',
            }}
            value={layer.name}
            onChange={e => update('name', e.target.value)}
            onFocus={e => (e.target.style.borderColor = '#58a6ff')}
            onBlur={e => (e.target.style.borderColor = '#30363d')}
          />
        </Field>
      )}

      {/* Units */}
      {(layer.type === 'dense' || layer.type === 'lstm' || layer.type === 'gru' || layer.type === 'feedForward' || layer.type === 'output') && showParam('units') && (
        <Field label={label('units', 'Units')}>
          <NumberInput value={layer.units || 0} min={1} onChange={v => update('units', v)} />
        </Field>
      )}

      {/* Filters */}
      {layer.type === 'conv2d' && showParam('filters') && (
        <Field label={label('filters', 'Filters')}>
          <NumberInput value={layer.filters || 0} min={1} onChange={v => update('filters', v)} />
        </Field>
      )}

      {/* Kernel Size */}
      {layer.type === 'conv2d' && showParam('kernelSize') && (
        <Field label="Kernel Size">
          <div className="flex gap-1.5">
            <NumberInput
              value={layer.kernelSize?.[0] || 3}
              min={1}
              onChange={v => update('kernelSize', [v, layer.kernelSize?.[1] || 3])}
            />
            <NumberInput
              value={layer.kernelSize?.[1] || 3}
              min={1}
              onChange={v => update('kernelSize', [layer.kernelSize?.[0] || 3, v])}
            />
          </div>
        </Field>
      )}

      {/* Pool Size */}
      {layer.type === 'maxPool2d' && showParam('poolSize') && (
        <Field label="Pool Size">
          <div className="flex gap-1.5">
            <NumberInput
              value={layer.poolSize?.[0] || 2}
              min={1}
              onChange={v => update('poolSize', [v, layer.poolSize?.[1] || 2])}
            />
            <NumberInput
              value={layer.poolSize?.[1] || 2}
              min={1}
              onChange={v => update('poolSize', [layer.poolSize?.[0] || 2, v])}
            />
          </div>
        </Field>
      )}

      {/* Dropout Rate */}
      {layer.type === 'dropout' && showParam('rate') && (
        <Field label={label('rate', 'Rate')}>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none"
            style={{ backgroundColor: '#21262d', border: '1px solid #30363d', color: '#f0f6fc' }}
            value={layer.rate || 0.5}
            onChange={e => update('rate', parseFloat(e.target.value))}
            onFocus={e => (e.target.style.borderColor = '#58a6ff')}
            onBlur={e => (e.target.style.borderColor = '#30363d')}
          />
        </Field>
      )}

      {/* Embedding */}
      {layer.type === 'embedding' && showParam('vocabSize') && (
        <Field label="Vocab Size">
          <NumberInput value={layer.vocabSize || 10000} min={1} onChange={v => update('vocabSize', v)} />
        </Field>
      )}
      {layer.type === 'embedding' && showParam('embeddingDim') && (
        <Field label={label('embeddingDim', 'Embedding Dim')}>
          <NumberInput value={layer.embeddingDim || 128} min={1} onChange={v => update('embeddingDim', v)} />
        </Field>
      )}

      {/* Attention */}
      {layer.type === 'multiHeadAttention' && showParam('numHeads') && (
        <Field label={label('numHeads', 'Num Heads')}>
          <NumberInput value={layer.numHeads || 8} min={1} onChange={v => update('numHeads', v)} />
        </Field>
      )}
      {layer.type === 'multiHeadAttention' && showParam('keyDim') && (
        <Field label="Key Dim">
          <NumberInput value={layer.keyDim || 64} min={1} onChange={v => update('keyDim', v)} />
        </Field>
      )}

      {/* Input Shape */}
      {layer.type === 'input' && showParam('inputShape') && (
        <Field label={label('inputShape', 'Input Shape')}>
          <input
            className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none font-mono"
            style={{ backgroundColor: '#21262d', border: '1px solid #30363d', color: '#f0f6fc' }}
            value={layer.inputShape?.join(', ') || '784'}
            onChange={e => {
              const shape = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
              if (shape.length > 0) update('inputShape', shape);
            }}
            onFocus={e => (e.target.style.borderColor = '#58a6ff')}
            onBlur={e => (e.target.style.borderColor = '#30363d')}
          />
          <p className="text-[10px] mt-0.5" style={{ color: '#484f58' }}>Comma-separated dimensions</p>
        </Field>
      )}

      {/* Return Sequences */}
      {(layer.type === 'lstm' || layer.type === 'gru') && showParam('returnSequences') && (
        <Field label="Return Sequences">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              className="relative w-8 h-4 rounded-full transition-colors"
              style={{ backgroundColor: layer.returnSequences ? '#1d6fcc' : '#30363d' }}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={layer.returnSequences || false}
                onChange={e => update('returnSequences', e.target.checked)}
              />
              <div
                className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full transition-transform"
                style={{
                  backgroundColor: '#f0f6fc',
                  transform: layer.returnSequences ? 'translateX(16px)' : 'translateX(0)',
                }}
              />
            </div>
            <span className="text-xs" style={{ color: layer.returnSequences ? '#58a6ff' : '#8b949e' }}>
              {layer.returnSequences ? 'On' : 'Off'}
            </span>
          </label>
        </Field>
      )}

      {/* Activation Function */}
      {layer.activation !== undefined && showParam('activation') && (
        <div className="space-y-1.5">
          <Field label={label('activation', 'Activation')}>
            <select
              className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
              style={{ backgroundColor: '#21262d', border: '1px solid #30363d', color: '#f0f6fc' }}
              value={layer.activation}
              onChange={e => update('activation', e.target.value as ActivationFn)}
            >
              {Object.entries(ACTIVATIONS).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </Field>
          <div className="flex items-center gap-2.5 pt-0.5">
            <ActivationViz activation={layer.activation} />
            <p className="text-[10px] flex-1 leading-relaxed" style={{ color: '#8b949e' }}>
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
      <label
        className="text-[10px] font-semibold uppercase tracking-widest block mb-1"
        style={{ color: '#6e7681' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function NumberInput({ value, min, onChange }: { value: number; min: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={min}
      className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none"
      style={{ backgroundColor: '#21262d', border: '1px solid #30363d', color: '#f0f6fc' }}
      value={value}
      onChange={e => onChange(parseInt(e.target.value) || min)}
      onFocus={e => (e.target.style.borderColor = '#58a6ff')}
      onBlur={e => (e.target.style.borderColor = '#30363d')}
    />
  );
}
