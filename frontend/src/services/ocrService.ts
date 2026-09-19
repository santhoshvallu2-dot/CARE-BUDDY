import { createWorker, Worker } from 'tesseract.js';
import { OcrProgress, OcrResult } from '../types';

let cachedWorker: Worker | null = null;
let isInitializingWorker = false;

/**
 * Preprocesses and downscales large images on a canvas to optimize OCR speed and memory usage
 * without losing text readability.
 */
export async function preprocessImage(imageSrc: string | File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const maxDim = 1800; // Optimal for OCR speed and crisp character recognition
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(typeof imageSrc === 'string' ? imageSrc : URL.createObjectURL(imageSrc));
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG data URL
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      } catch {
        resolve(typeof imageSrc === 'string' ? imageSrc : URL.createObjectURL(imageSrc));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for preprocessing'));
    };

    if (typeof imageSrc === 'string') {
      img.src = imageSrc;
    } else {
      img.src = URL.createObjectURL(imageSrc);
    }
  });
}

/**
 * Initializes or retrieves a singleton Tesseract worker.
 */
async function getWorker(onProgress?: (progress: OcrProgress) => void): Promise<Worker> {
  if (cachedWorker) {
    return cachedWorker;
  }

  if (isInitializingWorker) {
    // Wait for in-flight initialization
    let attempts = 0;
    while (isInitializingWorker && attempts < 30) {
      await new Promise((r) => setTimeout(r, 100));
      attempts++;
    }
    if (cachedWorker) return cachedWorker;
  }

  isInitializingWorker = true;
  try {
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (onProgress && m.status) {
          const progressPercent = Math.round((m.progress || 0) * 100);
          let friendlyStatus = 'Initializing OCR engine...';
          if (m.status === 'loading tesseract core') friendlyStatus = 'Loading OCR Core...';
          else if (m.status === 'loading language traineddata') friendlyStatus = 'Loading Medical Language Data...';
          else if (m.status === 'initializing api') friendlyStatus = 'Preparing Text Recognition...';
          else if (m.status === 'recognizing text') friendlyStatus = `Reading Document (${progressPercent}%)...`;

          onProgress({
            status: friendlyStatus,
            progress: progressPercent,
          });
        }
      },
    });

    cachedWorker = worker;
    return worker;
  } finally {
    isInitializingWorker = false;
  }
}

/**
 * Main OCR recognition entry point.
 */
export async function recognizeTextFromImage(
  imageInput: string | File | Blob,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  try {
    if (onProgress) {
      onProgress({ status: 'Optimizing image for reading...', progress: 10 });
    }

    // 1. Preprocess & normalize image
    const processedImage = await preprocessImage(imageInput);

    if (onProgress) {
      onProgress({ status: 'Initializing OCR engine...', progress: 25 });
    }

    // 2. Obtain Tesseract worker
    const worker = await getWorker(onProgress);

    if (onProgress) {
      onProgress({ status: 'Reading text from healthcare document...', progress: 50 });
    }

    // 3. Perform OCR
    const ret = await worker.recognize(processedImage);
    const rawText = ret.data.text ? ret.data.text.trim() : '';
    const confidence = ret.data.confidence || 0;

    if (onProgress) {
      onProgress({ status: 'Text extraction complete!', progress: 100 });
    }

    // Return result
    return {
      text: rawText,
      confidence,
    };
  } catch (error: unknown) {
    console.error('OCR Processing Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown OCR error occurred';
    return {
      text: '',
      confidence: 0,
      error: message,
    };
  }
}

/**
 * Clean up Tesseract worker when no longer needed
 */
export async function terminateOcrWorker(): Promise<void> {
  if (cachedWorker) {
    try {
      await cachedWorker.terminate();
    } catch {
      // Ignore cleanup error
    }
    cachedWorker = null;
  }
}
