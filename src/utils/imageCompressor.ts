/**
 * Image compressor and uploader utility for JE Imports Store.
 * Resizes high-resolution smartphone/camera photos to a clean web-ready format,
 * reducing 5MB-15MB photos down to ~150KB for fast transfer and storage across all devices.
 */

export async function compressImage(
  file: File, 
  maxWidth = 1200, 
  maxHeight = 1200, 
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or tiny icon, keep as is
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed WebP or JPEG
        const mimeType = 'image/jpeg';
        const compressedBase64 = canvas.toDataURL(mimeType, quality);
        resolve(compressedBase64);
      };

      img.onerror = () => {
        // Fallback to raw data URL
        resolve(e.target?.result as string);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image (either raw file or base64) to the server `/api/upload-image`.
 * Returns the permanent public image URL (e.g. `/uploads/img-...jpg`).
 * Falls back to the compressed base64 if server is temporarily unreachable.
 */
export async function uploadImageToServer(file: File): Promise<string> {
  try {
    const compressedBase64 = await compressImage(file);

    // Try posting to server upload endpoint
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: compressedBase64,
        filename: file.name,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
    }

    // Fallback to compressed base64
    return compressedBase64;
  } catch (err) {
    console.warn('[Upload] Falling back to compressed base64:', err);
    return await compressImage(file);
  }
}
