import React, { useState } from 'react';
import { exportKundaliPDF } from '../utils/pdfExport';
import './ExportPDFButton.css';

/**
 * ExportPDFButton — One-click button to download complete Kundali report as PDF.
 *
 * Props:
 *   reportRef:  React ref attached to the report DOM container.
 *   personName: Name of the person for filename.
 */
export default function ExportPDFButton({ reportRef, personName = 'Profile' }) {
  const [exporting, setExporting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  const handleExport = async () => {
    if (!reportRef?.current) return;
    setExporting(true);
    setProgressMsg('Starting PDF export...');

    try {
      await exportKundaliPDF(reportRef.current, personName, (msg) => {
        setProgressMsg(msg);
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="export-pdf-wrapper">
      <button
        type="button"
        className="btn btn--export-pdf"
        onClick={handleExport}
        disabled={exporting}
        title="Download complete Kundali report as high-quality PDF"
      >
        <span>{exporting ? '⏳' : '📥'}</span>
        <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
      </button>
      {exporting && progressMsg && (
        <span className="export-pdf__status">{progressMsg}</span>
      )}
    </div>
  );
}
