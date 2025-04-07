from fastapi import APIRouter
from pydantic import BaseModel
from src.retrieval import retrieve_relevant_resources
from src.bot.mistral import create_ollama_prompt, query_ollama
from src.utils import print_wrapped
from src import state_value

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

@router.post("/query")
def query_pdf(req: QueryRequest):
    query = req.query

    results = retrieve_relevant_resources(
        query=query,
        embeddings=state_value.embeddings,
        model=state_value.embedding_manager.model,
        pages_and_chunks=state_value.pages_and_chunks
    )

    ollama_prompt = create_ollama_prompt(query, results)
    print_wrapped(ollama_prompt)

    mistral_response = query_ollama(ollama_prompt)

    return {
        "query": query,
        "prompt": ollama_prompt,
        "response": mistral_response
    }
