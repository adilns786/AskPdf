# AskPDF

A sophisticated document interaction system that enables natural language-based PDF analysis. Upload PDFs and engage with their content through an intuitive interface powered by advanced NLP models for document summarization and question-answering capabilities.

## 🚀 Features

### Document Management
- Intuitive drag-and-drop interface for PDF uploads
- Interactive document preview functionality
- Efficient document storage and retrieval system

### AI-Powered Analysis
- Natural language question-answering for document content
- Comprehensive document summarization
- Dynamic model switching between Hugging Face and Google Gemini
- Source attribution for generated answers

### Technical Capabilities
- Intelligent document chunking for processing optimization
- Multi-threaded analysis for enhanced performance
- Advanced caching system for rapid query responses
- Split-screen interface combining PDF viewer and chat

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js
- **UI Components**: Custom PDF viewer
- **Interface**: Modern split-screen layout with drag-and-drop capabilities

### Backend
- **Server**: FastAPI
- **PDF Processing**: PyMuPDF
- **Performance**: Multi-threaded architecture

### AI Integration
- **Models**: Hugging Face & Google Gemini
- **Processing**: Custom prompt engineering
- **Analysis**: Advanced document chunking algorithms

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 14.0.0 or higher
- Google Gemini API key

## 🔧 Installation

1. Clone the repository
```bash
git clone https://github.com/adilns786/AskPdf.git
cd AskPdf
```

2. Set up backend environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure frontend
```bash
cd frontend
npm install
```

4. Configure environment variables
```bash
# Create .env file in backend directory
GEMINI_API_KEY=your_gemini_api_key
```

> Get your free Gemini API key at: https://aistudio.google.com/app/apikey

## 🚀 Running the Application

1. Launch backend server
```bash
cd backend
uvicorn app:app --reload
```
wait till "Application Startup Complete" is printed in server terminal

2. Start frontend development server
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## 🔄 API Endpoints

### GET `/test/`
- **Purpose**: API health check
- **Response**: `{"message": "API is working"}`

### POST `/upload_pdf/`
- **Purpose**: PDF upload and text extraction
- **Input**: PDF file
- **Response**: Filename and 300-character content preview

### POST `/ask_question/`
- **Purpose**: Question-answering based on PDF content
- **Parameters**:
  - `pdf_filename`: Name of uploaded PDF
  - `question`: User query about PDF content
- **Response**: Question and generated answer

### POST `/summarize/`
- **Purpose**: PDF content summarization
- **Parameter**: `pdf_filename`
- **Response**: Filename and content summary

### POST `/chat_gemini/`
- **Purpose**: Gemini-powered PDF analysis
- **Parameters**:
  - `pdf_filename`: Target PDF
  - `question`: User query
- **Response**: AI-generated answer using Gemini

## 💡 Usage Guide

1. **Document Upload**
   - Use drag-and-drop or file selector to upload PDF
   - Preview document in left panel

2. **Content Analysis**
   - Utilize chat interface in right panel
   - Ask specific questions about the document
   - Request document summaries
   - Switch between AI models as needed

3. **Results Review**
   - View AI-generated responses
   - Examine source chunks used for answers
   - Toggle between different analysis modes

## 🔮 Future Enhancements

- Text-to-speech capabilities
- Extended model integrations
- Improved chunking algorithms
- Collaborative features
- Enhanced caching system

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open Pull Request

## 👏 Acknowledgments

- The FastAPI team
- React.js community
- Hugging Face and Google Gemini teams
- PyMuPDF developers

## 📫 Contact

Adil - [@adilns786](https://twitter.com/adilns786)

Project Repository: [github.com/adilns786/AskPdf](https://github.com/adilns786/AskPdf.git)
