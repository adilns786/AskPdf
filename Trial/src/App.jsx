import React, { useState, useEffect } from "react";
import { Send, PanelLeftOpen, PanelLeftClose, Upload, Download } from "lucide-react";
import axios from "axios";
import PDFViewer from "./PdfView";

const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      const fileUrl = URL.createObjectURL(selectedFile);
      setPdfUrl(fileUrl);
      setIsPanelOpen(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await axios.post("http://127.0.0.1:8000/upload_pdf/", formData);
        setPdfName(response.data.filename);
        setPdfText(response.data.pdf_text);
        setChat((prev) => [...prev, {
          role: "assistant",
          content: `PDF "${response.data.filename}" loaded successfully.`
        }]);
      } catch (error) {
        console.error("Error uploading PDF:", error);
        setChat((prev) => [...prev, {
          role: "assistant",
          content: "Failed to upload the PDF. Please try again."
        }]);
        URL.revokeObjectURL(fileUrl);
        setPdfUrl(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !pdfName) return;

    setChat((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/ask_question/", null, {
        params: {
          pdf_filename: pdfName,
          question: message,
        },
      });

      const { answer, relevant_chunks } = response.data.answer;

      setChat((prev) => [...prev, {
        role: "assistant",
        content: answer ? answer.toString() : "No answer available"
      }]);

      if (Array.isArray(relevant_chunks) && relevant_chunks.length > 0) {
        setChat((prev) => [...prev, {
          role: "assistant",
          content: "📄 Relevant sections found:",
          chunks: relevant_chunks
        }]);
      }
    } catch (error) {
      console.error("Error asking question:", error);
      setChat((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, something went wrong while processing your question."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title={isPanelOpen ? "Hide PDF" : "Show PDF"}
              >
                {isPanelOpen ? (
                  <PanelLeftClose className="h-5 w-5 text-gray-600" />
                ) : (
                  <PanelLeftOpen className="h-5 w-5 text-gray-600" />
                )}
              </button>
              <span className="font-medium text-gray-800">PDF Chat Assistant</span>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="fileUpload"
              />
              <label
                htmlFor="fileUpload"
                className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </label>
              {pdfName && (
                <span className="text-sm text-gray-600 truncate max-w-xs">
                  {pdfName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Panel */}
        {isPanelOpen && pdfUrl && (
          <div className="w-1/2 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">PDF Preview</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <PDFViewer pdfUrl={pdfUrl} pdfText={pdfText} />
            </div>
          </div>
        )}

        {/* Chat Section */}
        <div className={`flex-1 flex flex-col ${isPanelOpen ? 'w-1/2' : 'w-full'}`}>
          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {chat.map((msg, index) => (
              <div key={index} className={`flex space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl rounded-lg p-4 ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white ml-12' 
                    : 'bg-white shadow-sm border border-gray-200 mr-12'
                }`}>
                  <p>{msg.content}</p>
                  {msg.chunks && (
                    <div className="mt-2 space-y-2">
                      {msg.chunks.map((chunk, idx) => (
                        <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-500">Page {chunk.page}</div>
                          <div>{chunk.text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question about the PDF..."
                className="w-full p-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!pdfName}
              />
              <button
                type="submit"
                disabled={!pdfName || !message.trim()}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  !pdfName || !message.trim() 
                    ? 'text-gray-300' 
                    : 'text-blue-500 hover:text-blue-600'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;