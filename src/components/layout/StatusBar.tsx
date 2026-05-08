import { useStore } from '../../store';

export function StatusBar() {
  const {
    layers, buildError, isModelBuilt, isRunningInference,
    isTraining, trainingEpoch, trainingTotalEpochs, currentLoss,
  } = useStore();

  return (
    <footer className="flex items-center gap-4 px-4 py-1 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 shrink-0 h-7">
      <span>{layers.length} layers</span>
      <div className="h-3 w-px bg-gray-300" />
      {buildError && (
        <span className="text-red-500">Build Error: {buildError}</span>
      )}
      {isModelBuilt && !buildError && !isTraining && !isRunningInference && (
        <span className="text-green-600">Model ready</span>
      )}
      {isRunningInference && (
        <span className="text-blue-500">Running inference...</span>
      )}
      {isTraining && (
        <span className="text-orange-500">
          Training: Epoch {trainingEpoch}/{trainingTotalEpochs}
          {currentLoss !== null && ` — Loss: ${currentLoss.toFixed(4)}`}
        </span>
      )}
      {!isModelBuilt && !buildError && !isTraining && (
        <span>Add layers to build a network</span>
      )}
    </footer>
  );
}
