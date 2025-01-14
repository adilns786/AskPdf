import React, { useState } from "react";
import { Upload, FileText, MessageSquare } from "lucide-react";

const EmptyChatState = ({ handleFileUpload ,chat}) => {
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload({ target: { files: [file] } });
    }
  };

  const handleClickUpload = () => {
    document.getElementById("pdf-input").click();
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <FileText className="w-16 h-16 text-blue-500" />
            <div className="absolute -bottom-2 -right-2 bg-blue-100 rounded-full p-2">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          Welcome to Ask Pdf
        </h3>

        <p className="text-gray-600 mb-6">
          Upload a PDF document to get started. You can ask questions, get
          summaries, and interact with your document's content.
        </p>

        <div
          className={`border-2 border-dashed ${dragging ? "border-blue-500" : "border-gray-300"} rounded-lg p-6 bg-gray-50`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex justify-center mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Click the upload button in the top bar or drag and drop your PDF here
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={handleClickUpload}
          >
            Upload PDF
          </button>
        </div>

        <input
          id="pdf-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
            <span>✨ Ask Questions</span>
          </div>
          <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
            <span>📝 Get Summaries</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyChatState;
