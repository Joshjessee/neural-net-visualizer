import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../store';
import { buildTfModel, runInference } from '../../utils/networkToTfModel';
import { generateSample, renderSampleToCanvas } from '../../utils/sampleData';

export function InferencePanel() {
  const {
    layers, setModelBuilt, setBuildError, setActivations,
    setRunningInference, setInferenceResult, isModelBuilt,
    buildError, isRunningInference, clearInference,
  } = useStore();

  const [sampleInput, setSampleInput] = useState<number[] | null>(null);
  const [sampleLabel, setSampleLabel] = useState<number | null>(null);
  const [outputProbs, setOutputProbs] = useState<number[] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<ReturnType<typeof buildTfModel>['model'] | null>(null);

  const hasInput = layers.some(l => l.type === 'input');
  const inputLayer = layers.find(l => l.type === 'input');
  const inputShape = inputLayer?.inputShape || [784];
  const inputSize = inputShape.reduce((a, b) => a * b, 1);
  const isLargeInput = inputSize > 50000;

  const handleBuild = useCallback(() => {
    clearInference();
    setSampleInput(null);
    setSampleLabel(null);
    setOutputProbs(null);
    const result = buildTfModel(layers);
    if (result.error) {
      setBuildError(result.error);
      modelRef.current = null;
    } else {
      setModelBuilt(true);
      setBuildError(null);
      modelRef.current = result.model;
    }
  }, [layers, clearInference, setBuildError, setModelBuilt]);

  const handleGenerate = useCallback(() => {
    const sample = generateSample(inputShape);
    setSampleInput(sample.input);
    setSampleLabel(sample.label);
    setOutputProbs(null);
  }, [inputShape]);

  useEffect(() => {
    if (sampleInput && canvasRef.current) {
      renderSampleToCanvas(sampleInput, canvasRef.current, inputShape);
    }
  }, [sampleInput, inputShape]);

  const handleInfer = useCallback(async () => {
    if (!modelRef.current || !sampleInput) return;
    setRunningInference(true);
    try {
      await new Promise(r => setTimeout(r, 50));
      const result = runInference(modelRef.current, sampleInput, inputShape);
      setInferenceResult(result.output);
      setOutputProbs(result.output);

      const storeActivations: Record<string, { values: number[]; shape: number[] }> = {};
      for (const [key, val] of Object.entries(result.activations)) {
        storeActivations[key] = val;
      }
      setActivations(storeActivations);
    } catch (e) {
      setBuildError((e as Error).message);
    } finally {
      setRunningInference(false);
    }
  }, [sampleInput, inputShape, setRunningInference, setInferenceResult, setActivations, setBuildError]);

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6e7681' }}>
        Live Inference
      </h3>

      {!hasInput && (
        <p className="text-xs" style={{ color: '#484f58' }}>Add an Input layer to enable inference.</p>
      )}

      {hasInput && (
        <>
          {/* Build */}
          <div className="space-y-1.5">
            <button
              onClick={handleBuild}
              disabled={layers.length < 2}
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

          {/* Generate Sample */}
          {isModelBuilt && (
            <div className="space-y-2 pt-2" style={{ borderTop: '1px solid #21262d' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6e7681' }}>
                  Sample Input
                </span>
                <button
                  onClick={handleGenerate}
                  className="text-[10px] px-2 py-1 rounded-md transition-colors"
                  style={{
                    backgroundColor: '#21262d',
                    border: '1px solid #30363d',
                    color: '#8b949e',
                  }}
                >
                  Generate
                </button>
              </div>

              {isLargeInput && !sampleInput && (
                <p className="text-[10px]" style={{ color: '#e3b341' }}>
                  ⚠ Large input ({inputSize.toLocaleString()} values). May take a moment.
                </p>
              )}

              {sampleInput && (
                <div className="flex items-center gap-3">
                  <canvas
                    ref={canvasRef}
                    className="rounded-lg"
                    style={{
                      width: 56, height: 56,
                      imageRendering: 'pixelated',
                      border: '1px solid #30363d',
                      backgroundColor: '#000',
                    }}
                  />
                  <div className="text-xs space-y-0.5">
                    <div style={{ color: '#8b949e' }}>
                      Shape: <span className="font-mono" style={{ color: '#c9d1d9' }}>[{inputShape.join(', ')}]</span>
                    </div>
                    {sampleLabel !== null && (
                      <div style={{ color: '#8b949e' }}>
                        Label: <span className="font-semibold" style={{ color: '#58a6ff' }}>{sampleLabel}</span>
                      </div>
                    )}
                    <div className="text-[9px] font-mono" style={{ color: '#484f58' }}>
                      {sampleInput.length.toLocaleString()} values
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Run Inference */}
          {isModelBuilt && sampleInput && (
            <div className="space-y-2 pt-2" style={{ borderTop: '1px solid #21262d' }}>
              <button
                onClick={handleInfer}
                disabled={isRunningInference}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                style={{
                  background: isRunningInference
                    ? '#21262d'
                    : 'linear-gradient(135deg, #1a7337 0%, #15803d 100%)',
                  color: '#ffffff',
                  border: isRunningInference ? '1px solid #30363d' : 'none',
                  boxShadow: isRunningInference ? 'none' : '0 2px 8px rgba(26,115,55,0.3)',
                }}
              >
                {isRunningInference ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full animate-pulse-dot inline-block" style={{ backgroundColor: '#58a6ff' }} />
                    Running…
                  </span>
                ) : '▶ Run Inference'}
              </button>

              {/* Output */}
              {outputProbs && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6e7681' }}>
                    Output
                  </span>
                  <div className="space-y-1">
                    {outputProbs.slice(0, 20).map((prob, i) => {
                      const maxProb = Math.max(...outputProbs.slice(0, 20));
                      const isMax = prob === maxProb;
                      const barWidth = Math.max(2, (Math.abs(prob) / (Math.abs(maxProb) || 1)) * 100);
                      return (
                        <div key={i} className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] w-4 text-right font-mono shrink-0"
                            style={{ color: isMax ? '#58a6ff' : '#484f58', fontWeight: isMax ? 700 : 400 }}
                          >
                            {i}
                          </span>
                          <div className="flex-1 h-2.5 rounded overflow-hidden" style={{ backgroundColor: '#21262d' }}>
                            <div
                              className="h-full rounded transition-all"
                              style={{
                                width: `${barWidth}%`,
                                background: isMax
                                  ? 'linear-gradient(90deg, #1d6fcc, #6741d9)'
                                  : '#30363d',
                                boxShadow: isMax ? '0 0 6px rgba(88,166,255,0.3)' : 'none',
                              }}
                            />
                          </div>
                          <span
                            className="text-[9px] w-10 text-right font-mono shrink-0"
                            style={{ color: isMax ? '#58a6ff' : '#484f58', fontWeight: isMax ? 700 : 400 }}
                          >
                            {prob >= 0 && prob <= 1
                              ? (prob * 100).toFixed(1) + '%'
                              : prob.toFixed(3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {outputProbs.length > 20 && (
                    <p className="text-[9px]" style={{ color: '#484f58' }}>
                      Showing first 20 of {outputProbs.length} outputs
                    </p>
                  )}

                  {sampleLabel !== null && outputProbs.length <= 100 && (
                    <p className="text-[10px] pt-0.5" style={{ color: '#8b949e' }}>
                      Predicted: <span className="font-bold" style={{ color: '#58a6ff' }}>
                        {outputProbs.indexOf(Math.max(...outputProbs))}
                      </span>
                      {' · '}Actual: <span className="font-bold" style={{ color: '#e3b341' }}>
                        {sampleLabel}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
