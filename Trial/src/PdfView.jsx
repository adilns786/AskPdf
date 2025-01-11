import React, { useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf'; // Use React wrapper for PDF.js

const PDFViewer = ({ pdfUrl, highlights = [] }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // To track the container div for PDF and highlight
  const pdfContainerRef = useRef(null);

  // Handle loading of PDF
  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Handling the highlight action based on the passed highlights (which include page numbers)
  const renderHighlights = (page) => {
    // Ensure highlights is defined
    if (Array.isArray(highlights)) {
      return highlights
        .filter(highlight => highlight.page === page) // Filter based on page
        .map((highlight, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: highlight.top + 'px',
              left: highlight.left + 'px',
              width: highlight.width + 'px',
              height: highlight.height + 'px',
              backgroundColor: 'rgba(255, 255, 0, 0.5)', // Light yellow highlight
            }}
            className="absolute z-10"
          />
        ));
    }
    return null; // In case highlights is undefined or not an array
  };

  // Page navigation buttons
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));
  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      {/* PDF container */}
      <div
        ref={pdfContainerRef}
        className="relative flex-1 overflow-auto bg-white border rounded-lg shadow-md p-2"
        style={{ height: '70%' }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={onLoadSuccess}
        >
          <Page
            pageNumber={pageNumber}
            width={pdfContainerRef.current?.offsetWidth}
          />
          {/* Render the highlights for the current page */}
          {renderHighlights(pageNumber)}
        </Document>
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={goToPrevPage}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
        >
          Previous
        </button>
        <span className="text-lg">
          Page {pageNumber} of {numPages}
        </span>
        <button
          onClick={goToNextPage}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
