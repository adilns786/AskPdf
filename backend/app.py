from fastapi import FastAPI, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models.pdf_processor import extract_text_from_pdf,get_answer_from_pdf
from models.gemini_bot import analyze_pdf_content,answer_pdf_question
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
GEMINI_API_KEY =  os.getenv("GEMINI_API_KEY")

app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Replace with your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to store uploaded PDFs
UPLOAD_DIR = './uploads'

# Ensure the upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)
@app.on_event("startup")
async def startup_event():
    print("Application is starting...")

@app.on_event("shutdown")
async def shutdown_event():
    print("Application is shutting down...")

@app.get("/test/")
def test():
    return {"message": "API is working"}

@app.post("/upload_pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    """Endpoint for uploading PDF files and extracting text."""
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as pdf_file:
        content = await file.read()
        pdf_file.write(content)
    
    # Extract text from uploaded PDF
    pdf_text = extract_text_from_pdf(file_location)
    return {"filename": file.filename, "pdf_text": pdf_text[:300]}  # Return first 300 chars as a preview

@app.post("/ask_question/")
async def ask_question(
    pdf_filename: str = Query(..., description="The filename of the uploaded PDF"),
    question: str = Query(..., description="The question to ask about the PDF content")
):
    """Endpoint for asking questions about a PDF."""
    file_location = os.path.join(UPLOAD_DIR, pdf_filename)
    
    if not os.path.exists(file_location):
        return JSONResponse(status_code=404, content={"message": "PDF file not found"})
    
    # Get answer using the defined QA function
    answer = get_answer_from_pdf(file_location, question)
    
    return {"question": question, "answer": answer}

@app.post("/summarize/")
async def summarize(
    pdf_filename: str = Query(..., description="The filename of the uploaded PDF")
):
    """Endpoint for summarizing the content of a PDF."""
    file_location = os.path.join(UPLOAD_DIR, pdf_filename)
    
    if not os.path.exists(file_location):
        return JSONResponse(status_code=404, content={"message": "PDF file not found"})
    
    # Extract text from the PDF
    pdf_text = extract_text_from_pdf(file_location)
    
    # Use the analyze_pdf_content function to summarize
    summary = analyze_pdf_content(pdf_text, action="summarize", api_key=GEMINI_API_KEY)
    
    return {"filename": pdf_filename, "summary": summary}

@app.post("/chat_gemini/")
async def chat_gemini(
    pdf_filename: str = Query(..., description="The filename of the uploaded PDF"),
    question: str = Query(..., description="The question to ask about the PDF content")
):
    """Endpoint for asking questions about a PDF."""
    file_location = os.path.join(UPLOAD_DIR, pdf_filename)
    
    if not os.path.exists(file_location):
        return JSONResponse(status_code=404, content={"message": "PDF file not found"})
   
    pdf_text = extract_text_from_pdf(file_location)
        
    # Get answer using the defined QA function
    answer = answer_pdf_question(pdf_text, question, api_key=GEMINI_API_KEY)
    
    return {"question": question, "answer": answer}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
