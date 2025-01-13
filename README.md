📄 PDF Chat Application
This project is a PDF chat application that allows users to upload PDF files, ask questions about the content, and receive answers. It also provides features for summarizing PDF content and interacting with a chat bot.
📋 Table of Contents
📋 Prerequisites
⚙️ Installation
🔧 Backend
🖥️ Frontend
🚀 Running the Backend Server
🌐 Running the Frontend
🛠️ Usage
🔑 Environment Variables
🤝 Contributing
📜 License
📋 Prerequisites
Before you begin, ensure you have met the following requirements:
Node.js and npm installed on your machine.
Python 3.8 or higher installed.
pip for Python package management.
virtualenv for creating isolated Python environments.
⚙️ Installation
🔧 Backend
Clone the repository:
Create a virtual environment:
Activate the virtual environment:
On Windows:
On macOS and Linux:
4. Install the required packages:
🖥️ Frontend
Navigate to the frontend directory:
Install the dependencies:
🚀 Running the Backend Server
1. Ensure your virtual environment is activated.
2. Run the server using Uvicorn:
The server will start on http://127.0.0.1:8000.
🌐 Running the Frontend
1. Navigate to the frontend directory if not already there:
Start the React application:
The frontend will be available at http://localhost:5173.
🛠️ Usage
📂 Upload a PDF file using the upload button in the application.
❓ Ask questions about the PDF content in the chat interface.
📜 Use the summarize feature to get a summary of the PDF content.
🤖 Interact with the chat bot for additional insights.
🔑 Environment Variables
Create a .env file in the backend directory and add the following:
Replace your_gemini_api_key_here with your actual Gemini API key.
🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.
📜 License