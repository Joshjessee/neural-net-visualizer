import { useStore } from '../../store';

export function StatusBar() {
  const {
    layers, buildError, isModelBuilt, isRunningInference,
    isTraining, trainingEpoch, trainingTotalEpochs, currentLoss,
  } = useStore();

  return (
    <footer
      className="flex items-center gap-4 px-4 shrink-0 h-7 text-xs select-none"
      style={{
        backgroundColor: '#161b22',
        borderTop: '1px solid #30363d',
        color: '#6e7681',
      }}
    >
      {/* Layer count */}
      <span style={{ color: '#6e7681' }}>
        {layers.length} {layers.length === 1 ? 'layer' : 'layers'}
      </span>

      <div className="h-3 w-px" style={{ backgroundColor: '#30363d' }} />

      {/* Status messages */}
      {buildError && (
        <span className="flex items-center gap-1.5" style={{ color: '#f85149' }}>
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: '#f85149' }}
          />
          Build error: {buildError}
        </span>
      )}

      {isModelBuilt && !buildError && !isTraining && !isRunningInference && (
        <span className="flex items-center gap-1.5" style={{ color: '#3fb950' }}>
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: '#3fb950' }}
          />
          Model ready
        </span>
      )}

      {isRunningInference && (
        <span className="flex items-center gap-1.5" style={{ color: '#58a6ff' }}>
          <span
            className="w-1.5 h-1.5 rounded-full inline-block animate-pulse-dot"
            style={{ backgroundColor: '#58a6ff' }}
          />
          Running inference…
        </span>
      )}

      {isTraining && (
        <span className="flex items-center gap-1.5" style={{ color: '#e3b341' }}>
          <span
            className="w-1.5 h-1.5 rounded-full inline-block animate-pulse-dot"
            style={{ backgroundColor: '#e3b341' }}
          />
          Training — Epoch {trainingEpoch}/{trainingTotalEpochs}
          {currentLoss !== null && ` · Loss: ${currentLoss.toFixed(4)}`}
        </span>
      )}

      {!isModelBuilt && !buildError && !isTraining && layers.length === 0 && (
        <span style={{ color: '#6e7681' }}>Add layers to get started</span>
      )}

      <div className="flex-1" />

      <span style={{ color: '#30363d', fontSize: '10px' }}>Neural Net Builder</span>
    </footer>
  );
}
