import { useState, useRef, useCallback } from 'react';
import { useStore } from '../../store';
import { buildTfModel, runInference } from '../../utils/networkToTfModel';
import { trainModel, type TrainingHandle } from '../../utils/trainModel';
import { LossChart } from '../shared/LossChart';

export function TrainingPanel() {
  const {
    layers, isModelBuilt, buildError,
    setModelBuilt, setBuildError, setActivations, clearInference,
    isTraining, trainingEpoch, trainingTotalEpochs,
    lossHistory, accuracyHistory, currentLoss, currentAccuracy,
    trainingConfig, setTraining, setTrainingProgress,
    appendLoss, appendAccuracy, setTrainingConfig, resetTraining,
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
          if (logs.acc !== undefined) appendAccuracy(logs.acc);
        },
        onTrainingEnd: () => {
          setTraining(false);
          if (modelRef.current) {
            try {
              const dummyInput = new Array(inputShape.reduce((a, b) => a * b, 1)).fill(0).map(() => Math.random());
              const result = runInference(modelRef.current, dummyInput, inputShape);
              setActivations(result.activations);
            } catch { /* skip */ }
          }
        },
        onError: (error) => {
          setTraining(false);
          setTrainingError(error);
        },
      },
    );
  }, [trainingConfig, layers, inputShape, resetTraining, setTraining, setTrainingProgress, appendLoss, appendAccuracy, setActivations]);

  const handleStopTraining = useCallback(() => {
    trainingHandleRef.current?.stop();
    trainingHandleRef.current = null;
    setTraining(false);
  }, [setTraining]);

  const progress = trainingTotalEpochs > 0 ? (trainingEpoch / trainingTotalEpochs) * 100 : 0;

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6e7681' }}>
        Training
      </h3>

      {!hasInput && (
        <p className="text-xs" style={{ color: '#484f58' }}>Add an Input layer to enable training.</p>
      )}

      {hasInput && (
        <>
          {/* Build */}
          <div className="space-y-1.5">
            <button
              onClick={handleBuild}
              disabled={layers.length < 2 || isTraining}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #1d6fcc 0%, #6741d9 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 2px 8px rgba(29,111,204,0.3)',
              }}
            >
              {isModelBuilt ? '↺ Rebuild Model' : '⚡ Build Model'}
            </button>

            {isModelBuilt && !buildError && (
              <p className="text-[10px] flex items-center gap-1" style={{ color: '#3fb950' }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: '#3fb950' }} />
                Model built successfully
              </p>
            )}
            {buildError && (
              <p className="text-[10px]" style={{ color: '#f85149' }}>✕ {buildError}</p>
            )}
          </div>

          {/* Config */}
          {isModelBuilt && (
            <div className="space-y-2 pt-2" style={{ borderTop: '1px solid #21262d' }}>
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6e7681' }}>
                Configuration
              </span>

              <ConfigRow label="Dataset">
                <select
                  value={trainingConfig.datasetId}
                  onChange={e => setTrainingConfig({ datasetId: e.target.value as 'mnist' | 'regression' })}
                  disabled={isTraining}
                  className="text-[11px] rounded px-1.5 py-1 w-28 outline-none cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: '#21262d', border: '1px solid #30363d', color: '#f0f6fc' }}
                >
                  <option value="mnist">MNIST</option>
                  <option value="regression">Regression</option>
                </select>
              </ConfigRow>

              <ConfigRow label="Epochs">
                <input
                  type="number" min={1} max={100}
                  value={trainingConfig.epochs}
                  onChange={e => setTrainingConfig({ epochs: Math.max(1, parseInt(e.target.value) || 1) })}
                  disabled={isTraining}
                  className="text-[11px] rounded px-1.5 py-1 w-16 text-right outline-none disabled:opacity-50"
                  style={{ backgroundColor: '#21262d', border: '1px solid #30363d', color: '#f0f6fc' }}
                />
              </ConfigRow>

              <ConfigRow label="Batch Size">
                <input
                  type="number" min={1} max={512}
                  value={trainingConfig.batchSize}
                  onChange={e => setTrainingConfig({ batchSize: Math.max(1, parseInt(e.target.value) || 32) })}
                  disabled={isTraining}
                  className="text-[11px] rounded px-1.5 py-1 w-16 text-right outline-none disabled:opacity-50"
                  style={{ backgroundColor: '#21262d', border: '1px solid #30363d', color: '#f0f6fc' }}
                />
              </ConfigRow>

              <ConfigRow label="Learning Rate">
                <input
                  type="number" min={0.00001} max={1} step={0.0001}
                  value={trainingConfig.learningRate}
                  onChange={e => setTrainingConfig({ learningRate: parseFloat(e.target.value) || 0.001 })}
                  disabled={isTraining}
                  className="text-[11px] rounded px-1.5 py-1 w-20 text-right outline-none disabled:opacity-50"
                  style={{ backgroundColor: '#21262d', border: '1px solid #30363d', color: '#f0f6fc' }}
                />
              </ConfigRow>
            </div>
          )}

          {/* Start / Stop */}
          {isModelBuilt && (
            <div className="space-y-2 pt-2" style={{ borderTop: '1px solid #21262d' }}>
              {!isTraining ? (
                <button
                  onClick={handleStartTraining}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #1a7337 0%, #15803d 100%)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(26,115,55,0.3)',
                  }}
                >
                  ▶ Start Training
                </button>
              ) : (
                <button
                  onClick={handleStopTraining}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(153,27,27,0.3)',
                  }}
                >
                  ■ Stop Training
                </button>
              )}

              {/* Progress */}
              {(isTraining || lossHistory.length > 0) && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span style={{ color: '#8b949e' }}>
                      Epoch {trainingEpoch} / {trainingTotalEpochs}
                    </span>
                    {currentLoss !== null && (
                      <span className="font-mono" style={{ color: '#c9d1d9' }}>
                        Loss: {currentLoss.toFixed(4)}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: '#21262d' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #1d6fcc, #6741d9)',
                        boxShadow: progress > 0 ? '0 0 6px rgba(88,166,255,0.4)' : 'none',
                      }}
                    />
                  </div>

                  {currentAccuracy !== null && (
                    <div className="text-[11px]" style={{ color: '#8b949e' }}>
                      Accuracy: <span style={{ color: '#58a6ff' }}>{(currentAccuracy * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Charts */}
              {lossHistory.length > 0 && (
                <div className="space-y-2 pt-2" style={{ borderTop: '1px solid #21262d' }}>
                  <LossChart data={lossHistory} label="Loss" color="#f87171" />
                  {accuracyHistory.length > 0 && (
                    <LossChart data={accuracyHistory} label="Accuracy" color="#58a6ff" />
                  )}
                </div>
              )}

              {trainingError && (
                <p className="text-[10px]" style={{ color: '#f85149' }}>✕ {trainingError}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between text-[11px]">
      <span style={{ color: '#8b949e' }}>{label}</span>
      {children}
    </label>
  );
}
