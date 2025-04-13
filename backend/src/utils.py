import textwrap
from dotenv import load_dotenv
import os
from config import MONGO_URI
load_dotenv()

def print_wrapped(text: str, wrap_length: int = 80):
    """Print text with wrapping."""
    wrapped_text = textwrap.fill(text, wrap_length)
    print(wrapped_text)
    
    

from pymongo import MongoClient

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