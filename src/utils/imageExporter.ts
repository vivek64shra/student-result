import { toJpeg } from 'html-to-image';

/**
 * Downloads a DOM element as a high-quality A4-proportioned JPG image.
 * Works seamlessly on Android Chrome, iOS Safari, and Desktop browsers.
 */
export async function downloadElementAsJpg(
  elementId: string,
  fileName: string = 'Document.jpg',
  onProgress?: (isGenerating: boolean) => void
): Promise<boolean> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element with id "${elementId}" not found for JPG export.`);
    alert('डाउनलोड हेतु दस्तावेज़ उपलब्ध नहीं है।');
    return false;
  }

  try {
    if (onProgress) onProgress(true);

    // Give browser a microtask to settle render and images
    await new Promise((resolve) => setTimeout(resolve, 80));

    // High quality export (pixelRatio 2 for crisp A4 print quality, jpeg quality 0.95)
    const dataUrl = await toJpeg(node, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      cacheBust: true,
      filter: (domNode) => {
        // Exclude elements with print:hidden or print-hidden classes if desired, but
        // usually on screen we want to capture the document card itself (marksheet or fee-receipt-card)
        if (domNode instanceof HTMLElement) {
          if (domNode.classList.contains('no-export') || domNode.classList.contains('print-hidden')) {
            return false;
          }
        }
        return true;
      },
    });

    // Trigger download
    const link = document.createElement('a');
    link.download = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? fileName : `${fileName}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (err: any) {
    console.error('Error generating JPG image:', err);
    alert('JPG डाउनलोड करने में समस्या आई। आप प्रिंट विकल्प से भी सेव कर सकते हैं।');
    return false;
  } finally {
    if (onProgress) onProgress(false);
  }
}
