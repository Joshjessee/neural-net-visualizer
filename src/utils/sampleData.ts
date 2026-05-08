// Generate sample data for inference testing, matching the network's input shape

export function generateSample(inputShape: number[]): { input: number[]; label: number } {
  const totalSize = inputShape.reduce((a, b) => a * b, 1);
  const label = Math.floor(Math.random() * 10);

  // For small-ish inputs (≤ 784), generate a structured digit-like pattern
  if (totalSize <= 784) {
    return { input: generateDigitPattern(totalSize, label), label };
  }

  // For larger inputs, generate a simple random pattern with structure
  // Use a smaller allocation-safe approach
  const maxAlloc = Math.min(totalSize, 50000); // Cap at 50k to prevent allocation failures
  const input = new Array(maxAlloc);
  for (let i = 0; i < maxAlloc; i++) {
    // Create a gradient/blob pattern based on label
    const t = i / maxAlloc;
    const wave = Math.sin(t * Math.PI * (label + 1) * 2) * 0.5 + 0.5;
    const noise = Math.random() * 0.1;
    input[i] = wave * 0.8 + noise;
  }

  // If the actual size is larger than maxAlloc, pad with zeros
  if (totalSize > maxAlloc) {
    for (let i = maxAlloc; i < totalSize; i++) {
      input.push(0);
    }
  }

  return { input, label };
}

function generateDigitPattern(size: number, label: number): number[] {
  const input = new Array(size).fill(0);

  // Figure out a 2D grid to draw on
  const side = Math.ceil(Math.sqrt(size));

  for (let i = 0; i < size; i++) {
    const x = i % side;
    const y = Math.floor(i / side);
    const cx = side / 2, cy = side / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const maxR = side / 2;

    if (label === 0 && dist > maxR * 0.4 && dist < maxR * 0.7) input[i] = 1;
    else if (label === 1 && Math.abs(x - cx) < side * 0.07 && y > side * 0.15 && y < side * 0.85) input[i] = 1;
    else if (label === 2 && (y < side * 0.3 || y > side * 0.7 || (y > side * 0.4 && y < side * 0.6)) && x > side * 0.2 && x < side * 0.8) input[i] = 1;
    else if (label === 3 && ((y < side * 0.2) || (y > side * 0.4 && y < side * 0.6) || (y > side * 0.8)) && x > side * 0.2 && x < side * 0.8) input[i] = 1;
    else if (label === 4 && ((x < side * 0.35 && y < side * 0.55) || Math.abs(x - side * 0.65) < side * 0.07)) input[i] = 1;
    else if (label === 5 && ((y < side * 0.2 && x > side * 0.2) || (y > side * 0.4 && y < side * 0.6 && x < side * 0.8) || (y > side * 0.8 && x < side * 0.8))) input[i] = 1;
    else if (label === 6 && (dist < maxR * 0.7 && (y > cy || x < side * 0.35))) input[i] = 1;
    else if (label === 7 && ((y < side * 0.2) || Math.abs(x - cx + (y - side * 0.2) * 0.3) < side * 0.07)) input[i] = 1;
    else if (label === 8 && ((dist > maxR * 0.2 && dist < maxR * 0.45) || (dist > maxR * 0.55 && dist < maxR * 0.8))) input[i] = 1;
    else if (label === 9 && (dist < maxR * 0.7 && (y < cy || x > side * 0.65))) input[i] = 1;
    else input[i] = Math.random() * 0.05;
  }

  return input;
}

export function renderSampleToCanvas(
  data: number[],
  canvas: HTMLCanvasElement,
  inputShape: number[],
  displaySize = 56
) {
  // Determine the 2D rendering dimensions
  let width: number, height: number;

  if (inputShape.length >= 2) {
    // For 2D+ data, use first two dims
    height = inputShape[0];
    width = inputShape[1];
  } else {
    // For flat data, make it square-ish
    const side = Math.ceil(Math.sqrt(data.length));
    width = side;
    height = side;
  }

  // Cap rendering resolution to prevent huge canvas
  const maxDim = 64;
  const renderW = Math.min(width, maxDim);
  const renderH = Math.min(height, maxDim);

  canvas.width = displaySize;
  canvas.height = displaySize;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(renderW, renderH);

  const channels = inputShape.length >= 3 ? inputShape[inputShape.length - 1] : 1;
  const pixelCount = renderW * renderH;

  for (let i = 0; i < pixelCount; i++) {
    if (channels >= 3) {
      // RGB
      const baseIdx = i * channels;
      imgData.data[i * 4] = Math.floor((data[baseIdx] ?? 0) * 255);
      imgData.data[i * 4 + 1] = Math.floor((data[baseIdx + 1] ?? 0) * 255);
      imgData.data[i * 4 + 2] = Math.floor((data[baseIdx + 2] ?? 0) * 255);
    } else {
      // Grayscale
      const val = Math.floor((data[i] ?? 0) * 255);
      imgData.data[i * 4] = val;
      imgData.data[i * 4 + 1] = val;
      imgData.data[i * 4 + 2] = val;
    }
    imgData.data[i * 4 + 3] = 255;
  }

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = renderW;
  tempCanvas.height = renderH;
  tempCanvas.getContext('2d')!.putImageData(imgData, 0, 0);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, 0, 0, displaySize, displaySize);
}
