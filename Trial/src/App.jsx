import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import axios from "axios";
import Navbar from "./Sections/Topbar";
import Chatbox from "./Sections/ChatInterface";
import PdfPreview from "./Sections/PdfSec";

const App = () => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [chunks, setChunks] = useState([]);
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // state to manage server URL (localhost or deployed)
  const [serverUrl, setServerUrl] = useState("http://127.0.0.1:8000");

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      const fileUrl = URL.createObjectURL(selectedFile);
      setPdfUrl(fileUrl);
      setIsPanelOpen(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await axios.post(`${serverUrl}/upload_pdf/`, formData);
        setPdfName(response.data.filename);
        setPdfText(response.data.pdf_text);
        setChat((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `PDF "${response.data.filename}" loaded successfully.`,
          },
        ]);
      } catch (error) {
        console.error("Error uploading PDF:", error);
        setChat((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Failed to upload the PDF. Please try again.",
          },
        ]);
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
      const response = await axios.post(`${serverUrl}/ask_question/`, null, {
        params: {
          pdf_filename: pdfName,
          question: message,
        },
      });
      const { answer, relevant_chunks } = response.data.answer;

      setChat((prev) => [
        ...prev,
        { role: "assistant", content: answer || "No answer available" },
      ]);

      if (Array.isArray(relevant_chunks) && relevant_chunks.length > 0) {
        setChat((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "📄 Relevant sections found:",
            chunks: relevant_chunks,
          },
        ]);
        setChunks(relevant_chunks);
      }
    } catch (error) {
      console.error("Error asking question:", error);
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong while processing your question.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Call for summarize API route
  const handleSummarize = async () => {
    try {
      const response = await axios.post(`${serverUrl}/summarize/`, null, {
        params: { pdf_filename: pdfName },
      });
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: response.data.summary },
      ]);
    } catch (error) {
      console.error("Error summarizing:", error);
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to summarize." },
      ]);
    }
  };

  // Call for chat_gemini API route
  const handleChatGemini = async (e) => {
    e.preventDefault();
    if (!message.trim() || !pdfName) return;

    setChat((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${serverUrl}/chat_gemini/`, null, {
        params: {
          pdf_filename: pdfName,
          question: message,
        },
      });
      console.log(response.data)
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: response.data.answer },
      ]);
    } catch (error) {
      console.error("Error in chat_gemini:", error);
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Error in chat process." },
      ]);
    }finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar
        isPanelOpen={isPanelOpen}
        setIsPanelOpen={setIsPanelOpen}
        handleFileUpload={handleFileUpload}
        pdfName={pdfName}
        setServerUrl={setServerUrl} // Function to update server URL
      />

      {/* PDF Preview and Chat Section */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-4rem)]">
        <PdfPreview isPanelOpen={isPanelOpen} pdfUrl={pdfUrl} chunks={chunks} />
        <Chatbox
          chat={chat}
          isLoading={isLoading}
          message={message}
          setMessage={setMessage}
          handleSubmit={handleSubmit}
          handleSummarize={handleSummarize} // Button in UI for Summarize
          handleChatGemini={handleChatGemini} // Button in UI for Chat Gemini
          pdfName={pdfName}
        />
      </div>
    </div>
  );
};

export default App;
