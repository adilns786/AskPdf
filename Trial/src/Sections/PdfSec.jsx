import React from "react";
import PDFViewer from "./PdfView";

const PdfPreview = ({ isPanelOpen, pdfUrl, chunks }) => {
  if (!isPanelOpen || !pdfUrl) return null;

  return (
    <div className="w-1/2 border-r border-gray-200  h-full flex flex-col">
      {/* <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">PDF Preview</h2>
      </div> */}
      <div className="flex-1 overflow-auto h-full">
        <PDFViewer pdfUrl={pdfUrl} initialHighlights={chunks} />
      </div>
    </div>
  );
};

export default PdfPreview;
