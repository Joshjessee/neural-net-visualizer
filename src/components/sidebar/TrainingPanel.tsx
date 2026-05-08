import { useState, useRef, useCallback } from 'react';
import { useStore } from '../../store';
import { buildTfModel, runInference } from '../../utils/networkToTfModel';
import { trainModel, type TrainingHandle } from '../../utils/trainModel';
import { LossChart } from '../shared/LossChart';

export function TrainingPanel() {
  const {
    layers,
    isModelBuilt,
    buildError,
    setModelBuilt,
    setBuildError,
    setActivations,
    clearInference,
    isTraining,
    trainingEpoch,
    trainingTotalEpochs,
    lossHistory,
    accuracyHistory,
    currentLoss,
    currentAccuracy,
    trainingConfig,
    setTraining,
    setTrainingProgress,
    appendLoss,
    appendAccuracy,
    setTrainingConfig,
    resetTraining,
  } = useStore();

  const modelRef = useRef<ReturnType<typeof buildTfModel>['model'] | null>(null);
  const trainingHandleRef = useRef<TrainingHandle | null>(null);
  const [trainingError, setTrainingError] = useState<string | null>(null);

  const hasInput = layers.some(l => l.type === 'input');
  const inputLayer = layers.find(l => l.type === 'input');
  const inputShape = inputLayer?.inputShape || [784];

  const handleBuild = useCallback(() => {
    clearInference();
    resetTraining();
    setTrainingError(null);
    const result = buildTfModel(layers);
    if (result.error) {
      setBuildError(result.error);
      modelRef.current = null;
    } else {
      setModelBuilt(true);
      setBuildError(null);
      modelRef.current = result.model;
    }
  }, [layers, clearInference, resetTraining, setBuildError, setModelBuilt]);

  const handleStartTraining = useCallback(() => {
    if (!modelRef.current) return;

    setTrainingError(null);
    resetTraining();
    setTraining(true);
    setTrainingProgress(0, trainingConfig.epochs);

    trainingHandleRef.current = trainModel(
      modelRef.current,
      trainingConfig,
      layers,
      {
        onEpochEnd: (epoch, logs) => {
          setTrainingProgress(epoch + 1, trainingConfig.epochs);
          appendLoss(logs.loss);
          if (logs.acc !== undefined) {
            appendAccuracy(logs.acc);
          }
        },
        onTrainingEnd: () => {
          setTraining(false);

          // Capture activations after training completes for 3D viz
          // (cannot do this during training as model.fit() owns the tensors)
          if (modelRef.current) {
            try {
              const dummyInput = new Array(inputShape.reduce((a, b) => a * b, 1)).fill(0).map(() => Math.random());
              const result = runInference(modelRef.current, dummyInput, inputShape);
              setActivations(result.activations);
            } catch {
              // Skip activation capture on error
            }
          }
        },
        onError: (error) => {
          setTraining(false);
          setTrainingError(error);
        },
      },
    );
  }, [
    trainingConfig, layers, inputShape,
    resetTraining, setTraining, setTrainingProgress,
    appendLoss, appendAccuracy, setActivations,
  ]);

  const handleStopTraining = useCallback(() => {
    trainingHandleRef.current?.stop();
    trainingHandleRef.current = null;
    setTraining(false);
  }, [setTraining]);

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Training
      </h3>

      {!hasInput && (
        <p className="text-xs text-gray-400">Add an Input layer to enable training.</p>
      )}

      {hasInput && (
        <>
          {/* Build Model */}
          <div className="space-y-1">
            <button
              onClick={handleBuild}
              disabled={layers.length < 2 || isTraining}
              className="w-full px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isModelBuilt ? 'Rebuild Model' : 'Build Model'}
            </button>
            {isModelBuilt && (
              <p className="text-[10px] text-green-600">Model built successfully</p>
            )}
            {buildError && (
              <p className="text-[10px] text-red-500">Error: {buildError}</p>
            )}
          </div>

          {/* Training Config */}
          {isModelBuilt && (
            <div className="space-y-2 border-t border-gray-100 pt-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Configuration</span>

              <label className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600">Dataset</span>
                <select
                  value={trainingConfig.datasetId}
                  onChange={e => setTrainingConfig({ datasetId: e.target.value as 'mnist' | 'regression' })}
                  disabled={isTraining}
                  className="text-[11px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 w-24 outline-none"
                >
                  <option value="mnist">MNIST</option>
                  <option value="regression">Regression</option>
                </select>
              </label>

              <label className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600">Epochs</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={trainingConfig.epochs}
                  onChange={e => setTrainingConfig({ epochs: Math.max(1, parseInt(e.target.value) || 1) })}
                  disabled={isTraining}
                  className="text-[11px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 w-16 text-right outline-none"
                />
              </label>

              <label className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600">Batch Size</span>
                <input
                  type="number"
                  min={1}
                  max={512}
                  value={trainingConfig.batchSize}
                  onChange={e => setTrainingConfig({ batchSize: Math.max(1, parseInt(e.target.value) || 32) })}
                  disabled={isTraining}
                  className="text-[11px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 w-16 text-right outline-none"
                />
              </label>

              <label className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600">Learning Rate</span>
                <input
                  type="number"
                  min={0.00001}
                  max={1}
                  step={0.0001}
                  value={trainingConfig.learningRate}
                  onChange={e => setTrainingConfig({ learningRate: parseFloat(e.target.value) || 0.001 })}
                  disabled={isTraining}
                  className="text-[11px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 w-20 text-right outline-none"
                />
              </label>
            </div>
          )}

          {/* Start/Stop */}
          {isModelBuilt && (
            <div className="space-y-2 border-t border-gray-100 pt-2">
              {!isTraining ? (
                <button
                  onClick={handleStartTraining}
                  className="w-full px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Start Training
                </button>
              ) : (
                <button
                  onClick={handleStopTraining}
                  className="w-full px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Stop Training
                </button>
              )}

              {/* Progress */}
              {(isTraining || lossHistory.length > 0) && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">
                      Epoch {trainingEpoch} / {trainingTotalEpochs}
                    </span>
                    {currentLoss !== null && (
                      <span className="text-gray-600 font-mono">
                        Loss: {currentLoss.toFixed(4)}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{
                        width: `${trainingTotalEpochs > 0 ? (trainingEpoch / trainingTotalEpochs) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  {currentAccuracy !== null && (
                    <div className="text-[11px] text-gray-500">
                      Accuracy: {(currentAccuracy * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              )}

              {/* Charts */}
              {lossHistory.length > 0 && (
                <div className="space-y-2 border-t border-gray-100 pt-2">
                  <LossChart data={lossHistory} label="Loss" color="#ef4444" />
                  {accuracyHistory.length > 0 && (
                    <LossChart data={accuracyHistory} label="Accuracy" color="#3b82f6" />
                  )}
                </div>
              )}

              {/* Training Error */}
              {trainingError && (
                <p className="text-[10px] text-red-500">Error: {trainingError}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
