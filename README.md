# PDF Interaction Application

An intelligent document interaction system that allows users to upload PDFs and interact with them through natural language queries. The application leverages advanced NLP models to provide document summaries and answer questions about PDF content.

## Features

- **PDF Upload & Management**
  - Drag-and-drop interface for PDF uploads
  - Document preview functionality
  - Efficient storage and retrieval system

- **Interactive Document Analysis**
  - Natural language question-answering about document content
  - Full document summarization
  - Split-screen interface with PDF preview and chat
  - Model switching between Hugging Face and Gemini for different analysis approaches

- **Advanced Processing**
  - Intelligent document chunking for efficient processing
  - Multithreaded processing for improved performance
  - Caching system for faster repeated queries
  - Transparent display of source chunks used for answers

## Tech Stack

### Frontend
- React.js
- PDF viewer component
- Modern UI/UX with split-screen layout
- Drag-and-drop file upload interface

### Backend
- FastAPI
- PyMuPDF for PDF processing
- SQLite/PostgreSQL for metadata storage
- Multi-threading implementation

### AI/ML Integration
- Hugging Face models for document analysis
- Google Gemini API for enhanced processing
- Custom prompt templates for optimal results

## Getting Started

### Prerequisites
```bash
python >= 3.8
node >= 14.0.0
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pdf-interaction-app.git
cd pdf-interaction-app
```

2. Install backend dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Set up environment variables:
```bash
# Backend (.env)
DATABASE_URL=your_database_url
GEMINI_API_KEY=your_gemini_api_key
STORAGE_TYPE=local  # or 's3' for cloud storage

# Frontend (.env)
REACT_APP_API_URL=http://localhost:8000
```

### Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Access the application at `http://localhost:3000`

## Usage

1. Upload a PDF using the drag-and-drop interface or file selector
2. View the PDF in the left panel
3. Use the chat interface in the right panel to:
   - Ask questions about the document
   - Generate document summaries
   - Toggle between Hugging Face and Gemini models
4. View source chunks used for generating answers

## API Endpoints

### PDF Management
- `POST /api/upload` - Upload a new PDF document
- `GET /api/documents` - List all uploaded documents
- `GET /api/documents/{id}` - Get specific document details

### Document Interaction
- `POST /api/query` - Process questions about a document
- `POST /api/summarize` - Generate document summary
- `GET /api/chunks/{id}` - Retrieve specific document chunks

## Performance Optimization

The application implements several optimization strategies:
- Document chunking for efficient processing
- Multi-threaded chunk analysis
- Result caching
- Efficient database indexing
- Optimized file storage management

## Future Improvements

- Text-to-speech functionality for summaries
- Additional NLP model integrations
- Enhanced document chunking algorithms
- Real-time collaboration features
- Advanced caching mechanisms

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- FastAPI for the efficient backend framework
- React.js for the frontend framework
- Hugging Face and Google Gemini for NLP capabilities
- PyMuPDF for PDF processing functionality

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/pdf-interaction-app](https://github.com/yourusername/pdf-interaction-app)