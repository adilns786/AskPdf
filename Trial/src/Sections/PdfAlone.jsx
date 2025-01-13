import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Upload } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set the correct worker source path
pdfjs.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.mjs';

// Initialize PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.js',
//   import.meta.url,
// ).toString();

const PDFViewer = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState(null);
  const [highlights, setHighlights] = useState([
    { id: 1, page: 1, x: 100, y: 150, width: 200, height: 50, color: 'rgba(255, 255, 0, 0.3)' },
    { id: 2, page: 1, x: 300, y: 300, width: 150, height: 30, color: 'rgba(0, 255, 0, 0.3)' },
  ]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setError(null);
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);
      setCurrentPage(1);
    } else {
      setError('Please upload a valid PDF file');
    }
  };

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(null);
  };

  const handleDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please try again with a different file.');
  };

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < numPages) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleZoom = (type) => {
    if (type === 'in' && scale < 2) {
      setScale(prev => prev + 0.1);
    } else if (type === 'out' && scale > 0.5) {
      setScale(prev => prev - 0.1);
    }
  };

  // Cleanup URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfFile) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, [pdfFile]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Upload Section */}
      <div className="mb-4">
        <label className="flex items-center gap-2 w-fit px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
          <Upload className="w-5 h-5" />
          Upload PDF
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        {error && (
          <p className="mt-2 text-red-500 text-sm">{error}</p>
        )}
      </div>

      {pdfFile ? (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-sm">
                Page {currentPage} of {numPages || '--'}
              </span>
              <button
                onClick={() => handlePageChange('next')}
                disabled={currentPage === numPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleZoom('out')}
                disabled={scale <= 0.5}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ZoomOut className="w-6 h-6" />
              </button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => handleZoom('in')}
                disabled={scale >= 2}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ZoomIn className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <div className="relative w-full h-full overflow-auto">
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <Document
                  file={pdfFile}
                  onLoadSuccess={handleDocumentLoadSuccess}
                  onLoadError={handleDocumentLoadError}
                  loading={
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Loading PDF...</p>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-full">
                      <p className="text-red-500">Error loading PDF!</p>
                    </div>
                  }
                  className="mx-auto"
                >
                  <Page
                    pageNumber={currentPage}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-lg bg-white"
                  />
                  {/* Highlight overlays */}
                  {highlights
                    .filter(highlight => highlight.page === currentPage)
                    .map(highlight => (
                      <div
                        key={highlight.id}
                        className="absolute pointer-events-none"
                        style={{
                          left: highlight.x,
                          top: highlight.y,
                          width: highlight.width,
                          height: highlight.height,
                          backgroundColor: highlight.color,
                        }}
                      />
                    ))}
                </Document>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-500">Upload a PDF to view it here</p>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;