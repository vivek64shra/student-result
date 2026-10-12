import { toJpeg } from 'html-to-image';
import html2canvas from 'html2canvas';

/**
 * Converts a DOM element into a high-resolution JPEG Data URL.
 * Uses html-to-image as primary engine with automatic seamless fallback to html2canvas.
 */
export async function getElementAsJpgDataUrl(
  elementId: string,
  onProgress?: (isGenerating: boolean) => void
): Promise<string | null> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element with id "${elementId}" not found for JPG export.`);
    return null;
  }

  try {
    if (onProgress) onProgress(true);

    // Allow UI and fonts a microtask to settle
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Attempt 1: html-to-image (fast, sharp SVG foreignObject rendering)
    try {
      const dataUrl = await toJpeg(node, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: true,
        cacheBust: false,
        filter: (domNode) => {
          if (domNode instanceof HTMLElement) {
            if (domNode.classList.contains('no-export') || domNode.classList.contains('print-hidden')) {
              return false;
            }
          }
          return true;
        },
      });

      if (dataUrl && dataUrl.length > 1000) {
        return dataUrl;
      }
    } catch (htmlToImageErr) {
      console.warn('html-to-image failed, falling back to html2canvas:', htmlToImageErr);
    }

    // Attempt 2: html2canvas fallback (pure canvas rasterizer, bypasses SVG restrictions)
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (el) => {
        return el.classList.contains('no-export') || el.classList.contains('print-hidden');
      },
    });

    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (err: any) {
    console.error('All JPG generation methods failed:', err);
    return null;
  } finally {
    if (onProgress) onProgress(false);
  }
}

/**
 * Downloads a DOM element as a high-quality A4-proportioned JPG image.
 * Works seamlessly on Android Chrome, iOS Safari, and Desktop browsers via Blob URLs.
 */
export async function downloadElementAsJpg(
  elementId: string,
  fileName: string = 'Document.jpg',
  onProgress?: (isGenerating: boolean) => void
): Promise<boolean> {
  try {
    const dataUrl = await getElementAsJpgDataUrl(elementId, onProgress);
    if (!dataUrl) {
      console.warn('Unable to generate JPG data for download');
      return false;
    }

    // Convert Data URL to Blob for universal mobile and desktop download compatibility
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const safeName = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? fileName : `${fileName}.jpg`;
    link.download = safeName;
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 400);

    return true;
  } catch (err: any) {
    console.error('Error downloading JPG:', err);
    return false;
  }
}

/**
 * Returns the DOM element as a File object for Web Share API.
 */
export async function getElementAsJpgFile(
  elementId: string,
  fileName: string = 'Document.jpg',
  onProgress?: (isGenerating: boolean) => void
): Promise<File | null> {
  try {
    const dataUrl = await getElementAsJpgDataUrl(elementId, onProgress);
    if (!dataUrl) return null;

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const safeName = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? fileName : `${fileName}.jpg`;
    return new File([blob], safeName, { type: 'image/jpeg' });
  } catch (err: any) {
    console.error('Error creating JPG file:', err);
    return null;
  }
}

/**
 * Shares an element as a JPG directly on WhatsApp / Mobile Native Share sheet.
 * If Web Share with files is supported (mobile Android Chrome, iOS Safari), it shares the file directly.
 * Otherwise, downloads the JPG file and opens WhatsApp with message.
 */
export async function shareElementAsJpg(
  elementId: string,
  fileName: string,
  shareTitle: string,
  shareText: string,
  onProgress?: (isGenerating: boolean) => void
): Promise<boolean> {
  try {
    const file = await getElementAsJpgFile(elementId, fileName, onProgress);

    // Check if Web Share API with files is supported
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: shareText,
        });
        return true;
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          // User dismissed the share sheet
          return true;
        }
        console.warn('Native file share failed, falling back to download + text:', shareErr);
      }
    }

    // Fallback: Download JPG directly to the device and open WhatsApp
    await downloadElementAsJpg(elementId, fileName, onProgress);

    const waText = `${shareTitle}\n\n${shareText}\n\n📎 आपकी रसीद JPG फोटो के रूप में आपके फोन में डाउनलोड हो गई है, कृपया इसे साथ में संलग्न (Attach) करके भेजें।`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    
    // Copy summary text to clipboard
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(waText).catch(() => {});
      }
    } catch {
      // ignore
    }

    window.location.href = waUrl;
    return true;
  } catch (err: any) {
    console.error('Error sharing element as JPG:', err);
    return false;
  }
}
