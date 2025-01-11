import fitz
from transformers import pipeline
from langchain.text_splitter import CharacterTextSplitter
import numpy as np
from typing import List, Dict
import logging
import re

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_relevant_chunks(chunks: List[str], question: str, qa_pipeline, batch_size: int = 5) -> List[Dict]:
    """Get chunks most relevant to the question using parallel batch processing."""
    chunk_scores = []

    def process_chunk(chunk):
        try:
            result = qa_pipeline(
                question=question,
                context=chunk,
                max_answer_len=100,
                handle_impossible_answer=True
            )
            logging.debug(f"Processed chunk | Score: {result['score']} | Answer: {result['answer']}")
            return {
                'chunk': chunk,
                'score': result['score'],
                'answer': result['answer']
            } if result['answer'].strip() else None
        except Exception as e:
            logging.error(f"Error processing chunk: {e}")
            return None

    # Use ThreadPoolExecutor for parallel processing
    with ThreadPoolExecutor(max_workers=batch_size) as executor:
        future_to_chunk = {executor.submit(process_chunk, chunk): chunk for chunk in chunks}

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

def get_answer_from_pdf(pdf_text: str, question: str, batch_size: int = 5) -> str:
    """Use Hugging Face transformer model to answer questions based on PDF content."""
    try:
        # Initialize QA pipeline
        logging.info("Initializing the QA pipeline...")
        qa_pipeline = pipeline(
            "question-answering",
            model="deepset/roberta-base-squad2",
            tokenizer="deepset/roberta-base-squad2"
        )
        
        # Use CharacterTextSplitter for chunking
        logging.info("Splitting text into chunks...")
        text_splitter = CharacterTextSplitter(
            separator="\n",
            chunk_size=500,
            chunk_overlap=100,
            length_function=len
        )
        chunks = text_splitter.split_text(pdf_text)
        logging.info(f"Text split into {len(chunks)} chunks.")
        
        # Evaluate and retrieve most relevant chunks
        logging.info("Scoring chunks using batch parallel processing...")
        top_chunks = get_relevant_chunks(chunks, question, qa_pipeline, batch_size=batch_size)
        
        if not top_chunks:
            logging.warning("No relevant chunks found.")
            return "I couldn't find a relevant answer in the document."
        
        # Combine the most relevant chunks for better context
        combined_context = " ".join([chunk['chunk'] for chunk in top_chunks])
        logging.debug(f"Combined context from top chunks:\n{combined_context[:500]}")  # Log only a snippet
        
        # Check if combined context is too short to extract useful answer
        if len(combined_context) < 50:
            logging.warning("Combined context is too short for generating a reliable answer.")
            return "The document doesn't provide enough relevant information for this question."

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
            return "I'm not confident about the answer based on the provided document."
        
        logging.info(f"Final Answer: {final_result['answer']} | Score: {final_result['score']}")
        return final_result['answer']

    except Exception as e:
        logging.error(f"Error while processing PDF for QA: {e}")
        raise
