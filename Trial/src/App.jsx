import React, { useState } from 'react';
import { Send } from 'lucide-react';
import axios from 'axios';
import PDFViewer from './PdfView';  // Assuming PdfView handles displaying the PDF

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const response = await axios.post('http://127.0.0.1:8000/upload_pdf/', formData);
        setPdfName(response.data.filename);
        setPdfText(response.data.pdf_text); // Assuming the server sends the text for preview
        setChat((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `PDF "${response.data.filename}" uploaded successfully. Preview: ${response.data.pdf_text}`,
          },
        ]);
      } catch (error) {
        console.error('Error uploading PDF:', error);
        setChat((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Failed to upload the PDF. Please try again.',
          },
        ]);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !pdfName) return;
  
    setChat((prev) => [...prev, { role: 'user', content: message }]);
    setMessage('');
    setIsLoading(true);
  
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/ask_question/',
        null, // No body is sent when using query parameters
        {
          params: {
            pdf_filename: pdfName, // Query parameter 1
            question: message,      // Query parameter 2
          },
        }
      );
  
      console.log(response.data);
      const { answer, relevant_chunks } = response.data.answer;
  
      // Display the answer content as string (use .toString() or JSON.stringify if it is an object)
      setChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer ? answer.toString() : 'No answer available', // Make sure content is a string
        },
      ]);
  
      // Safely check if relevant_chunks is an array before using forEach
      if (Array.isArray(relevant_chunks)) {
        relevant_chunks.forEach((chunk, index) => {
          setChat((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `Relevant Chunk ${index + 1} from Page ${chunk.page}: ${chunk.text ? chunk.text.toString() : ''}`,
            },
          ]);
        });
      } else {
        setChat((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'No relevant chunks found.',
          },
        ]);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong while processing your question.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
    
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img
              src="/api/placeholder/32/32"
              alt="Planet Logo"
              className="h-8"
            />
            <span className="font-medium text-gray-800">planet</span>
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
              className="px-4 py-1.5 border border-gray-300 rounded-full text-sm cursor-pointer"
            >
              Upload PDF
            </label>
            <span className="text-sm text-gray-600">{pdfName || 'No PDF uploaded'}</span>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      {pdfName && pdfText && (
        <div className="p-4 max-w-7xl mx-auto">
          <h2 className="text-xl mb-4">PDF Preview</h2>
          <PDFViewer pdfText={pdfText} /> {/* Display PDF preview */}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-auto p-4 space-y-6 max-w-7xl mx-auto">
        {chat.map((msg, index) => (
          <div key={index} className="flex space-x-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'assistant'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-purple-200 text-purple-600'
              }`}
            >
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className="flex-1">
              <p className="text-gray-600">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center">
            <div className="h-5 w-5 animate-spin border-t-2 border-blue-600 border-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question about the PDF..."
              className="w-full p-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
