import torch
from sentence_transformers import SentenceTransformer
import pandas as pd
import numpy as np
from tqdm import tqdm
class EmbeddingManager:
    def __init__(self, model_name: str = "all-mpnet-base-v2"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = SentenceTransformer(model_name_or_path=model_name, device=self.device)
    
    def generate_embeddings(self, chunks: list[dict]) -> list[dict]:
        """Generate embeddings for text chunks."""
        for item in tqdm(chunks, desc="Generating embeddings"):
            item['embedding'] = self.model.encode(item['sentence_chunk'])
        return chunks
    
    def save_embeddings(self, chunks: list[dict], save_path: str):
        """Save embeddings to CSV file."""
        df = pd.DataFrame(chunks)
        df.to_csv(save_path, index=False)
    
    def load_embeddings(self, file_path: str) -> tuple[torch.Tensor, list[dict]]:
        """Load embeddings from CSV file."""
        df = pd.read_csv(file_path)
        df["embedding"] = df["embedding"].apply(lambda x: np.fromstring(x.strip("[]"), sep=" "))
        pages_and_chunks = df.to_dict(orient="records")
        embeddings = torch.tensor(np.array(df["embedding"].tolist()), 
                                dtype=torch.float32).to(self.device)
        return embeddings, pages_and_chunks