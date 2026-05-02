/**
 * Loads PDF.js in the browser using the **legacy** ESM build.
 *
 * The default `pdfjs-dist` entry (`build/pdf.mjs`) ships an inner webpack runtime that
 * can break when Next.js/webpack wraps it again, surfacing as:
 * `TypeError: Object.defineProperty called on non-object`.
 *
 * The legacy bundle is the supported path for bundled browser apps (see pdf.js examples).
 */
export async function loadPdfJsForBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only run in the browser.');
  }

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

  if (typeof pdfjs.getDocument !== 'function') {
    throw new Error('PDF.js failed to load (getDocument is missing).');
  }

  const version = pdfjs.version;
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;

  return pdfjs;
}
