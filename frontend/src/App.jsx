import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import axios from "axios";
import Navbar from "./Sections/Topbar";
import Chatbox from "./Sections/ChatInterface";
import PdfPreview from "./Sections/PdfSec";
import EmptyChatState from "./Sections/EmptyChat";

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
  const [isModalOpen, setIsModalOpen] = useState(false); // To toggle modal visibility

  useEffect(() => {
    const checkServerAvailability = async () => {
      try {
        // Trying to connect to the local server to check if it's running
        await axios.get(`${serverUrl}/test/`);
      } catch (error) {
        // If the connection fails, show the modal
        console.log("Local server is not available, asking user to switch...");
        setIsModalOpen(true);
      }
    };

    checkServerAvailability();
  }, []);
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
      console.log(response.data);
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
    } finally {
      setIsLoading(false);
    }
  };
  const handleServerChoice = (chosenServerUrl) => {
    setServerUrl(chosenServerUrl); // Update the server URL based on user choice
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar
        isPanelOpen={isPanelOpen}
        setIsPanelOpen={setIsPanelOpen}
        handleFileUpload={handleFileUpload}
        pdfName={pdfName}
        serverUrl={serverUrl}
        setServerUrl={setServerUrl} // Function to update server URL
      />

      {/* PDF Preview and Chat Section */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-4rem)]">
        <PdfPreview isPanelOpen={isPanelOpen} pdfUrl={pdfUrl} chunks={chunks} />
        {!pdfName ? (
      <EmptyChatState handleFileUpload={handleFileUpload} chat={chat}/>
    ) : (
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
    )}
       
        {/* Modal for selecting server */}
        {/* {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
            <div className="bg-white p-6 rounded-md">
              <h2 className="text-xl mb-4">Local server not available</h2>
              <p className="mb-6">Do you want to use the deployed server?</p>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mr-4"
                onClick={() =>
                  handleServerChoice("https://askpdf-aj8j.onrender.com")
                }
              >
                Yes, use deployed server
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                No, keep trying local server
              </button>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default App;
