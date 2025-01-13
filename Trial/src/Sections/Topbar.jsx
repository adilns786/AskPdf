import React from "react";
import { 
  PanelLeftOpen, 
  PanelLeftClose, 
  Upload, 
  BookOpen, 
  FileText, 
  Menu 
} from "lucide-react";

const Navbar = ({
  isPanelOpen,
  setIsPanelOpen,
  handleFileUpload,
  pdfName,
  serverUrl,
  setServerUrl,
}) => {
  const handleServerChange = (e) => {
    setServerUrl(e.target.value); // Update the server URL based on the selection
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div className="max-w-full mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Left section with logo and title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500"
              title={isPanelOpen ? "Hide PDF" : "Show PDF"}
            >
              {isPanelOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </button>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <h1 className="hidden md:block font-semibold text-gray-900">
                PDF Chat Assistant
              </h1>
            </div>
          </div>

          {/* Center section with file name */}
          {pdfName && (
            <div className="hidden md:flex items-center max-w-md">
              <div className="px-3 py-1.5 bg-gray-50 rounded-lg flex items-center">
                <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 truncate">
                  {pdfName}
                </span>
              </div>
            </div>
          )}

          {/* Right section with actions */}
          <div className="flex items-center space-x-4">
            <label className="relative inline-block">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="fileUpload"
              />
              <label
                htmlFor="fileUpload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors flex items-center focus:ring-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Upload PDF</span>
              </label>
            </label>

            {/* Server Dropdown */}
            <div className="flex items-center">
              <label
                htmlFor="serverSelect"
                className="text-gray-700 mr-2 text-sm font-medium"
              >
                Server:
              </label>
              <select
                id="serverSelect"
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={handleServerChange}
                value={serverUrl}
              >
                <option value="http://127.0.0.1:8000">Localhost</option>
                <option value="https://your-deployed-server-url.com">Deployed</option>
              </select>
            </div>

            {/* Mobile menu button */}
            <button className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
