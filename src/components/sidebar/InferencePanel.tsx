import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../store';
import { buildTfModel, runInference } from '../../utils/networkToTfModel';
import { generateSample, renderSampleToCanvas } from '../../utils/sampleData';

export function InferencePanel() {
  const {
    layers, setModelBuilt, setBuildError, setActivations,
    setRunningInference, setInferenceResult, isModelBuilt,
    buildError, isRunningInference, clearInference,
    startFlowAnimation, isFlowAnimating, flowActivations,
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
      startFlowAnimation(storeActivations, sampleInput, inputShape);
    } catch (e) {
      setBuildError((e as Error).message);
    } finally {
      setRunningInference(false);
    }
  }, [sampleInput, inputShape, setRunningInference, setInferenceResult, setActivations, setBuildError]);

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Live Inference
      </h3>

      {!hasInput && (
        <p className="text-xs text-gray-400">Add an Input layer to enable inference.</p>
      )}

      {hasInput && (
        <>
          {/* Build Model */}
          <div className="space-y-1">
            <button
              onClick={handleBuild}
              disabled={layers.length < 2}
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

          {/* Generate Sample */}
          {isModelBuilt && (
            <div className="space-y-2 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Sample Input</span>
                <button
                  onClick={handleGenerate}
                  className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Generate
                </button>
              </div>

              {isLargeInput && !sampleInput && (
                <p className="text-[10px] text-amber-600">
                  Large input ({inputSize.toLocaleString()} values). Sample generation may take a moment.
                </p>
              )}

              {sampleInput && (
                <div className="flex items-center gap-3">
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-200 rounded bg-black"
                    style={{ width: 56, height: 56, imageRendering: 'pixelated' }}
                  />
                  <div className="text-xs text-gray-500">
                    <div>Shape: [{inputShape.join(', ')}]</div>
                    {sampleLabel !== null && <div>Label: {sampleLabel}</div>}
                    <div className="text-[9px] text-gray-400">
                      {sampleInput.length.toLocaleString()} values
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Run Inference */}
          {isModelBuilt && sampleInput && (
            <div className="space-y-2 border-t border-gray-100 pt-2">
              <button
                onClick={handleInfer}
                disabled={isRunningInference}
                className="w-full px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {isRunningInference ? 'Running...' : 'Run Inference'}
              </button>

              {/* Replay Flow */}
              {outputProbs && !isFlowAnimating && flowActivations && sampleInput && (
                <button
                  onClick={() => startFlowAnimation(flowActivations, sampleInput, inputShape)}
                  className="w-full px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  Replay Data Flow
                </button>
              )}

              {isFlowAnimating && (
                <p className="text-[10px] text-orange-600 text-center animate-pulse">
                  Animating data flow...
                </p>
              )}

              {/* Output */}
              {outputProbs && (
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Output</span>
                  <div className="space-y-0.5">
                    {outputProbs.slice(0, 20).map((prob, i) => {
                      const maxProb = Math.max(...outputProbs.slice(0, 20));
                      const isMax = prob === maxProb;
                      const width = Math.max(2, (Math.abs(prob) / (Math.abs(maxProb) || 1)) * 100);
                      return (
                        <div key={i} className="flex items-center gap-1">
                          <span className={`text-[10px] w-4 text-right ${isMax ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
                            {i}
                          </span>
                          <div className="flex-1 h-3 bg-gray-100 rounded overflow-hidden">
                            <div
                              className={`h-full rounded transition-all ${isMax ? 'bg-blue-500' : 'bg-gray-300'}`}
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <span className={`text-[9px] w-10 text-right ${isMax ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
                            {prob >= 0 && prob <= 1
                              ? (prob * 100).toFixed(1) + '%'
                              : prob.toFixed(3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {outputProbs.length > 20 && (
                    <p className="text-[9px] text-gray-400">Showing first 20 of {outputProbs.length} outputs</p>
                  )}
                  {sampleLabel !== null && outputProbs.length <= 100 && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      Predicted: <span className="font-bold text-blue-600">{outputProbs.indexOf(Math.max(...outputProbs))}</span>
                      {' | '}Actual: <span className="font-bold">{sampleLabel}</span>
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
