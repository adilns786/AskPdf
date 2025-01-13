import fitz
from transformers import pipeline
from langchain.text_splitter import CharacterTextSplitter
from typing import List, Dict
import logging
import re
import spacy
from collections import Counter

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_relevant_chunks(chunks: List[str], question: str, qa_pipeline, pdf_path: str, batch_size: int = 5) -> List[Dict]:
    """Get chunks most relevant to the question using parallel batch processing, and extract offset and page details."""
    chunk_scores = []

    def process_chunk(chunk, page_number):
        try:
            result = qa_pipeline(
                question=question,
                context=chunk,
                max_answer_len=100,
                handle_impossible_answer=True
            )
            logging.debug(f"Processed chunk | Score: {result['score']} | Answer: {result['answer']}")
            
            if result['answer'].strip():
                # Extract the position of the answer within the chunk
                start_offset = chunk.find(result['answer'])
                end_offset = start_offset + len(result['answer'])
                
                return {
                    'chunk': chunk,
                    'page': page_number,
                    'start_offset': start_offset,
                    'end_offset': end_offset,
                    'answer': result['answer'],
                    'score': result['score']
                }
            return None
        except Exception as e:
            logging.error(f"Error processing chunk: {e}")
            return None

    # Open the PDF to extract text and page information
    document = fitz.open(pdf_path)
    
    # Use ThreadPoolExecutor for parallel processing
    with ThreadPoolExecutor(max_workers=batch_size) as executor:
        future_to_chunk = {}
        
        # Split the PDF text and process each chunk by page number
        page_number = 1
        for page in document:
            page_text = page.get_text()
            text_splitter = CharacterTextSplitter(
                separator="\n",
                chunk_size=500,
                chunk_overlap=100,
                length_function=len
            )
            chunks = text_splitter.split_text(page_text)
            for chunk in chunks:
                future_to_chunk[executor.submit(process_chunk, chunk, page_number)] = chunk
            
            page_number += 1
        
        for future in as_completed(future_to_chunk):
            chunk_result = future.result()
            if chunk_result:
                chunk_scores.append(chunk_result)

    # Sort results by score and return the top chunks
    sorted_chunks = sorted(chunk_scores, key=lambda x: x['score'], reverse=True)[:3]
    logging.info(f"Top {len(sorted_chunks)} chunks selected for final answer computation.")
    return sorted_chunks

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF using PyMuPDF."""
    try:
        document = fitz.open(pdf_path)
        full_text = ""
        for page in document:
            full_text += page.get_text()
        logging.info(f"Extracted {len(full_text)} characters from PDF.")
        return full_text
    except Exception as e:
        logging.error(f"Error while extracting text from PDF: {e}")
        raise

def get_answer_from_pdf(pdf_path: str, question: str, batch_size: int = 5) -> Dict:
    """Use Hugging Face transformer model to answer questions based on PDF content and return relevant chunk details."""
    try:
        # Initialize QA pipeline
        logging.info("Initializing the QA pipeline...")
        qa_pipeline = pipeline(
            "question-answering",
            model="deepset/roberta-base-squad2",
            tokenizer="deepset/roberta-base-squad2"
        )

        # Extract text and process it into chunks
        logging.info("Getting relevant chunks from PDF...")
        top_chunks = get_relevant_chunks([], question, qa_pipeline, pdf_path, batch_size=batch_size)

        if not top_chunks:
            logging.warning("No relevant chunks found.")
            return {
                "answer": "I couldn't find a relevant answer in the document.",
                "relevant_chunks": []
            }

        # Combine the most relevant chunks for better context
        combined_context = " ".join([chunk['chunk'] for chunk in top_chunks])
        logging.debug(f"Combined context from top chunks:\n{combined_context[:500]}")  # Log only a snippet

        # Get the final answer from the combined context
        logging.info("Getting final answer from combined context...")
        final_result = qa_pipeline(
            question=question,
            context=combined_context,
            max_answer_len=150,
            handle_impossible_answer=True
        )

        if final_result['score'] < 0.1:  # Adjust threshold based on requirements
            logging.warning("Low confidence in the final result.")
            return {
                "answer": "I'm not confident about the answer based on the provided document.",
                "relevant_chunks": []
            }
        
        logging.info(f"Final Answer: {final_result['answer']} | Score: {final_result['score']}")

        # Package the relevant chunks and their locations
        relevant_chunks_response = [{
            "text": chunk['chunk'],
            "page": chunk['page'],
            "start_offset": chunk['start_offset'],
            "end_offset": chunk['end_offset']
        } for chunk in top_chunks]
        
        return {
            "answer": final_result['answer'],
            "relevant_chunks": relevant_chunks_response
        }

    except Exception as e:
        logging.error(f"Error while processing PDF for QA: {e}")
        return {
            "answer": f"An error occurred while processing the document.{e}",
            "relevant_chunks": []
        }

