import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports a comprehensive Kundali report element as a multi-page PDF.
 *
 * @param {HTMLElement} reportElement - The root DOM element containing the report sections.
 * @param {string} personName - Name of the person for the filename and header.
 * @param {function} onProgress - Optional callback for reporting progress string.
 */
export async function exportKundaliPDF(reportElement, personName = 'Kundali', onProgress = null) {
  if (!reportElement) {
    throw new Error('Report element not found for PDF generation');
  }

  if (onProgress) onProgress('Preparing document layout...');

  // A4 dimensions in mm
  const PDF_PAGE_WIDTH = 210;
  const PDF_PAGE_HEIGHT = 297;
  const MARGIN_X = 12;
  const MARGIN_Y = 12;
  const USABLE_WIDTH = PDF_PAGE_WIDTH - MARGIN_X * 2;   // 186 mm
  const USABLE_HEIGHT = PDF_PAGE_HEIGHT - MARGIN_Y * 2; // 273 mm

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Find all sections marked with data-pdf-section or fallback to main children
  const sections = Array.from(
    reportElement.querySelectorAll('[data-pdf-section]')
  );

  const targets = sections.length > 0 ? sections : [reportElement];

  let currentY = MARGIN_Y;
  let pageNumber = 1;

  // Add document header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(190, 80, 20); // Copper/Rust accent
  pdf.text(`Kundali Janmapatrika — ${personName}`, MARGIN_X, currentY + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })} · Kundali Milan Suite`, MARGIN_X, currentY + 9);

  currentY += 14;

  for (let i = 0; i < targets.length; i++) {
    const section = targets[i];
    if (onProgress) {
      onProgress(`Capturing section ${i + 1} of ${targets.length}...`);
    }

    // Temporarily ensure section is visible for canvas capture
    const canvas = await html2canvas(section, {
      scale: 2, // High resolution for crisp text & SVGs
      useCORS: true,
      backgroundColor: '#fdfaf5', // Parchment theme background
      logging: false,
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const imgHeightMm = (canvas.height * USABLE_WIDTH) / canvas.width;

    // Check if adding this section overflows the page
    if (currentY + imgHeightMm > PDF_PAGE_HEIGHT - MARGIN_Y && currentY > MARGIN_Y + 14) {
      // Add footer to current page
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(140, 140, 140);
      pdf.text(`Page ${pageNumber}`, PDF_PAGE_WIDTH / 2, PDF_PAGE_HEIGHT - 6, { align: 'center' });

      // Start new page
      pdf.addPage();
      pageNumber++;
      currentY = MARGIN_Y;
    }

    pdf.addImage(imgData, 'JPEG', MARGIN_X, currentY, USABLE_WIDTH, imgHeightMm);
    currentY += imgHeightMm + 4; // 4mm spacing between sections
  }

  // Add footer to the last page
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  pdf.setTextColor(140, 140, 140);
  pdf.text(`Page ${pageNumber}`, PDF_PAGE_WIDTH / 2, PDF_PAGE_HEIGHT - 6, { align: 'center' });

  if (onProgress) onProgress('Finalizing PDF download...');

  const safeName = personName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const todayStr = new Date().toISOString().slice(0, 10);
  pdf.save(`Kundali_${safeName}_${todayStr}.pdf`);
}
