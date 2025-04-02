import fitz  # PyMuPDF
import os
from tqdm import tqdm
import pandas as pd
from spacy.lang.en import English
import re

def text_formatter(text: str) -> str:
    """Performs minor formatting on text."""
    cleaned_text = text.replace("\n", " ").strip()
    return cleaned_text

def open_and_read_pdfs(pdf_paths: list[str]) -> list[dict]:
    """Opens multiple PDF files and reads their text content page by page."""
    all_pages_and_texts = []
    
    for pdf_path in pdf_paths:
        doc = fitz.open(pdf_path)
        for page_number, page in tqdm(enumerate(doc), desc=f"Processing {os.path.basename(pdf_path)}"):
            text = page.get_text()
            text = text_formatter(text)
            all_pages_and_texts.append({
                "file_name": os.path.basename(pdf_path),
                "page_number": page_number,
                "page_char_count": len(text),
                "page_word_count": len(text.split(" ")),
                "page_sentence_count_raw": len(text.split(". ")),
                "page_token_count": len(text) / 4,
                "text": text
            })
    return all_pages_and_texts

def process_text_chunks(pages_and_texts: list[dict], chunk_size: int = 10) -> list[dict]:
    """Process text into sentences and chunks."""
    nlp = English()
    nlp.add_pipe("sentencizer")
    
    # Split into sentences
    for item in tqdm(pages_and_texts, desc="Processing sentences"):
        item['sentences'] = [str(sent) for sent in nlp(item['text']).sents]
        item['page_sentence_count_spacy'] = len(item['sentences'])
    
    # Split into chunks
    for item in tqdm(pages_and_texts, desc="Creating chunks"):
        item['sentence_chunks'] = [item['sentences'][i:i + chunk_size] 
        for i in range(0, len(item['sentences']), chunk_size)]
        item['num_chunks'] = len(item['sentence_chunks'])
    
    # Create final chunk list
    pages_and_chunks = []
    for item in tqdm(pages_and_texts, desc="Finalizing chunks"):
        for sentence_chunk in item["sentence_chunks"]:
            chunk_dict = {
                "page_number": item["page_number"],
                "sentence_chunk": re.sub(r'\.([A-Z])', r'. \1', "".join(sentence_chunk).replace("  ", " ").strip()),
                "chunk_char_count": 0,
                "chunk_word_count": 0,
                "chunk_token_count": 0
            }
            chunk_dict["chunk_char_count"] = len(chunk_dict["sentence_chunk"])
            chunk_dict["chunk_word_count"] = len(chunk_dict["sentence_chunk"].split(" "))
            chunk_dict["chunk_token_count"] = len(chunk_dict["sentence_chunk"]) / 4
            pages_and_chunks.append(chunk_dict)
    
    return pages_and_chunks

def process_pdfs(pdf_folder: str) -> pd.DataFrame:
    """Main function to process PDFs and return a DataFrame."""
    pdf_files = [os.path.join(pdf_folder, f) for f in os.listdir(pdf_folder) 
                if f.endswith(".pdf")]
    pages_and_texts = open_and_read_pdfs(pdf_files)
    pages_and_chunks = process_text_chunks(pages_and_texts)
    return pd.DataFrame(pages_and_chunks)