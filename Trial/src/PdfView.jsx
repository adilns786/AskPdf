import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set the correct worker source path
pdfjs.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.mjs';

const PDFViewer = ({ pdfUrl, highlights = [] }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pdfContainerRef = useRef(null);

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Error loading PDF. Please try again.');
    setLoading(false);
  };

  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));

  const renderHighlights = (page) => {
    return highlights
      .filter((highlight) => highlight.page === page)
      .map((highlight, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: `${highlight.top}px`,
            left: `${highlight.left}px`,
            width: `${highlight.width}px`,
            height: `${highlight.height}px`,
            backgroundColor: 'rgba(255, 255, 0, 0.5)',
          }}
          className="absolute z-10"
        />
      ));
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div
        ref={pdfContainerRef}
        className="relative flex-1 overflow-auto bg-white border rounded-lg shadow-md p-2"
        style={{ height: '70vh' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-500 text-center p-4">{error}</div>
          </div>
        )}
        {!error && pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
          >
            <Page
              pageNumber={pageNumber}
              width={pdfContainerRef.current?.offsetWidth}
              renderAnnotationLayer
              renderTextLayer
            />
            {renderHighlights(pageNumber)}
          </Document>
        )}
      </div>

      {numPages && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className={`py-2 px-4 rounded-lg ${
              pageNumber <= 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            <ChevronLeft />
          </button>
          <span className="text-lg">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className={`py-2 px-4 rounded-lg ${
              pageNumber >= numPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
