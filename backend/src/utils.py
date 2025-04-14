import textwrap
from dotenv import load_dotenv
import os
from config import MONGO_URI,MONGO_DB_NAME
from pymongo import MongoClient
from gridfs import GridFS

load_dotenv()

client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]
fs = GridFS(db, collection="pdf_files")
pdfs_collection = db["pdfs"]

def print_wrapped(text: str, wrap_length: int = 80):
    """Print text with wrapping."""
    wrapped_text = textwrap.fill(text, wrap_length)
    print(wrapped_text)
    
    


def get_meta_phrases_from_db():
    MONGO_URL = MONGO_URI
    if not MONGO_URL:
        raise ValueError("MONGO_URI not found in environment variables")
    client = MongoClient(MONGO_URL)  # or your connection string
    db = client["chatbot"]
    collection = db["meta_phrases"]
    document = collection.find_one()

    if document:
        # Remove _id field and return the rest
        document.pop("_id", None)
        return document
    else:
        return {}

def is_meta_question(query: str):
    meta_phrases = get_meta_phrases_from_db()
    all_phrases = [phrase.lower() for phrases in meta_phrases.values() for phrase in phrases]
    
    lowered_query = query.lower()
    return any(phrase in lowered_query for phrase in all_phrases)


def get_pdf_metadata(pdf_id: str) -> dict:
    pdf_doc = pdfs_collection.find_one({"pdf_id": pdf_id})
    if not pdf_doc:
        raise ValueError(f"No PDF found with pdf_id: {pdf_id}")
    pdf_doc.pop("_id", None)
    return pdf_doc