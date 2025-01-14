import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.mjs';

const PDFViewer = ({ pdfUrl, highlights = [] }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const pdfContainerRef = useRef(null);
  const [localHighlights, setLocalHighlights] = useState([]);

  useEffect(() => {
    if (JSON.stringify(highlights) !== JSON.stringify(localHighlights)) {
      setLocalHighlights(highlights);
    }
  }, [highlights]);

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onLoadError = (error) => {
    console.error('Error loading PDF:', error.message);
    setError('Failed to load PDF. Please check the file and try again.');
    setLoading(false);
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) setPageNumber(pageNumber + 1);
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  };

  const rotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  const renderHighlights = (page) => {
    return localHighlights
      .filter((highlight) => highlight.page === page)
      .map((highlight, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: highlight.top * scale,
            left: highlight.left * scale,
            width: highlight.width * scale,
            height: highlight.height * scale,
            backgroundColor: 'rgba(255, 220, 0, 0.2)',
            borderRadius: '2px',
          }}
        />
      ));
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top toolbar */}
      {numPages && !error && (
        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100 bg-white shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-600">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={zoomOut}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-600">{Math.round(scale * 100)}%</span>
            <button 
              onClick={zoomIn}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-5 w-5 text-gray-600" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <button 
              onClick={rotate}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Rotate"
            >
              <RotateCw className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* PDF Container */}
      <div className="flex-1 overflow-hidden bg-gray-200">
        <div ref={pdfContainerRef} className="relative h-full overflow-auto flex justify-center p-1">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
            </div>
          )}
          {!error && pdfUrl && (
            <div className="inline-block shadow-lg rounded-lg overflow-scroll">
              <Document file={pdfUrl} onLoadSuccess={onLoadSuccess} onLoadError={onLoadError}>
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  rotate={rotation} 
                  renderAnnotationLayer 
                  renderTextLayer 
                  className="bg-white"
                />
                {renderHighlights(pageNumber)}
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;