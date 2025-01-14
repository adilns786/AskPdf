import React, { useRef, useEffect, useState } from "react";
import { Send, Bot, User, BookOpen, Sparkles } from "lucide-react";

const Chatbox = ({
  chat,
  isLoading,
  message,
  setMessage,
  handleSubmit,
  handleChatGemini,
  handleSummarize,
  pdfName,
}) => {
  const messagesEndRef = useRef(null);
  const [isGeminiChat, setIsGeminiChat] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, isLoading]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !pdfName || isRequestInProgress) return;

    setIsRequestInProgress(true);
    try {
      if (isGeminiChat) {
        await handleChatGemini(e);
      } else {
        await handleSubmit(e);
      }
    } finally {
      setIsRequestInProgress(false);
    }
  };
  const onSummarizeSubmit = async (e) => {
    e.preventDefault();
    if ( !pdfName || isRequestInProgress) return;

    setIsRequestInProgress(true);
    try {
      await handleSummarize(e)
    } finally {
      setIsRequestInProgress(false);
    }
  };
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Messages Container */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex space-x-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role !== "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
            )}

            <div
              className={`group relative max-w-2xl ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-100"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                {msg.chunks && (
                  <div className="mt-3 space-y-2">
                    {msg.chunks.map((chunk, idx) => (
                      <div
                        key={idx}
                        className="text-sm p-3 rounded-lg bg-blue-50 border border-blue-100"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                            Page {chunk.page}
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">{chunk.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Waiting animation */}
        {isLoading && (
          <div className="flex items-center space-x-2 py-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex space-x-2">
              <div
                className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-between items-center space-x-4">
            <button
              onClick={onSummarizeSubmit}
              disabled={!pdfName || isRequestInProgress}
              className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:hover:bg-indigo-50"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Summarize PDF
            </button>
            <label 
              className="flex items-center px-4 py-2 gap-2 rounded-lg text-sm font-medium transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                bg-green-100 text-green-600 hover:bg-indigo-100 disabled:hover:bg-indigo-50"
            >
              <input
                type="checkbox"
                checked={isGeminiChat}
                onChange={(e) => setIsGeminiChat(e.target.checked)}
                className="form-checkbox rounded text-emerald-600"
              />
              <span>Gemini Chat</span>
            </label>
            {/* <label className="flex items-center space-x-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isGeminiChat}
                onChange={(e) => setIsGeminiChat(e.target.checked)}
                className="form-checkbox rounded text-emerald-600"
              />
              <span>Gemini Chat</span>
            </label> */}
          </div>

          {/* Input Form */}
          <form onSubmit={onSubmit} className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={pdfName ? "Ask a question about the PDF..." : "Upload a PDF to start the conversation..."}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl
                text-gray-900 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              disabled={!pdfName || isRequestInProgress}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                onClick={onSubmit}
                disabled={!pdfName || !message.trim() || isRequestInProgress}
                className={`p-2 rounded-lg transition-colors ${
                  !pdfName || !message.trim() || isRequestInProgress
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
