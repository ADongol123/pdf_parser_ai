from sentence_transformers import util
import torch
import textwrap
from utils import print_wrapped
def retrieve_relevant_resources(query: str,
                             embeddings: torch.Tensor,
                             model,
                             pages_and_chunks: list[dict],
                             n_resources_to_return: int = 5) -> list[dict]:
    """Retrieve relevant resources based on query."""
    query_embedding = model.encode(query, convert_to_tensor=True)
    dot_scores = util.dot_score(query_embedding, embeddings)[0]
    scores, indices = torch.topk(dot_scores, k=n_resources_to_return)
    
    return [pages_and_chunks[idx] for idx in indices]

def print_results(query: str, results: list[dict]):
    """Print search results in a formatted way."""
    print(f"Query: {query}\n")
    print("Results:")
    for result in results:
        print(f"Score: {result.get('score', 'N/A')}")
        print_wrapped(result["sentence_chunk"])
        print(f"Page number: {result['page_number']}\n")