// KrishiCore v4 — Client-Side HTML5 Canvas Image Compressor
// Compresses 5MB–8MB camera images to <300KB for SHC upload
// Also computes grayscale variance sharpness score

/**
 * Compress an image file using HTML5 Canvas
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @param {number} options.maxDimension - Max width/height in pixels (default 1280)
 * @param {number} options.quality - JPEG/WebP quality 0-1 (default 0.72)
 * @param {string} options.format - Output format: 'image/webp' or 'image/jpeg'
 * @returns {Promise<{blob: Blob, originalKB: number, compressedKB: number, sharpnessScore: number, isBlurry: boolean, width: number, height: number}>}
 */
export async function compressImage(file, options = {}) {
  const {
    maxDimension = 1280,
    quality = 0.72,
    format = 'image/webp',
  } = options;

  const originalKB = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          // Calculate new dimensions maintaining aspect ratio
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height / width) * maxDimension);
              width = maxDimension;
            } else {
              width = Math.round((width / height) * maxDimension);
              height = maxDimension;
            }
          }

          // Draw to canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Calculate sharpness score using grayscale variance (Laplacian-like)
          const sharpnessScore = computeSharpness(ctx, width, height);
          const isBlurry = sharpnessScore < 15; // threshold for blurriness

          // Try WebP first, fallback to JPEG
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // Fallback to JPEG if WebP not supported
                canvas.toBlob(
                  (jpegBlob) => {
                    if (!jpegBlob) {
                      reject(new Error('Image compression failed'));
                      return;
                    }
                    resolve({
                      blob: jpegBlob,
                      originalKB,
                      compressedKB: Math.round(jpegBlob.size / 1024),
                      sharpnessScore: Math.round(sharpnessScore),
                      isBlurry,
                      width,
                      height,
                    });
                  },
                  'image/jpeg',
                  quality
                );
                return;
              }
              resolve({
                blob,
                originalKB,
                compressedKB: Math.round(blob.size / 1024),
                sharpnessScore: Math.round(sharpnessScore),
                isBlurry,
                width,
                height,
              });
            },
            format,
            quality
          );
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compute sharpness score using grayscale variance of Laplacian kernel
 * Higher score = sharper image
 */
function computeSharpness(ctx, width, height) {
  // Sample a center crop for performance
  const sampleSize = Math.min(256, width, height);
  const startX = Math.floor((width - sampleSize) / 2);
  const startY = Math.floor((height - sampleSize) / 2);

  const imageData = ctx.getImageData(startX, startY, sampleSize, sampleSize);
  const data = imageData.data;

  // Convert to grayscale
  const gray = new Float32Array(sampleSize * sampleSize);
  for (let i = 0; i < gray.length; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  // Apply Laplacian kernel [0,1,0; 1,-4,1; 0,1,0]
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  for (let y = 1; y < sampleSize - 1; y++) {
    for (let x = 1; x < sampleSize - 1; x++) {
      const idx = y * sampleSize + x;
      const laplacian =
        gray[idx - sampleSize] +
        gray[idx - 1] +
        gray[idx + 1] +
        gray[idx + sampleSize] -
        4 * gray[idx];
      sum += laplacian;
      sumSq += laplacian * laplacian;
      count++;
    }
  }

  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return Math.sqrt(variance);
}
