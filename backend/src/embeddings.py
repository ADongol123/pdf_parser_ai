import torch
from sentence_transformers import SentenceTransformer
import pandas as pd
import numpy as np
from tqdm import tqdm
import chromadb
from chromadb.utils import embedding_functions
class EmbeddingManager:
    def __init__(self, model_name: str = "all-mpnet-base-v2", persist_directory = "./chromadb"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = SentenceTransformer(model_name_or_path=model_name, device=self.device)
        self.chroma_client = chromadb.Client(chromadb.config.Settings(persist_directory=persist_directory))
        self.collection_name  = "pdf_chunks"
        self.collection = self.chroma_client.get_or_create_collection(name=self.collection_name)
        
    
    def generate_embeddings(self, chunks: list[dict]) -> list[dict]:
        """Generate embeddings for text chunks."""
        for item in tqdm(chunks, desc="Generating embeddings"):
            print(item,'items')
            item['embedding'] = self.model.encode(item['text'], normalize_embeddings=True).tolist()
        return chunks
    
    def save_embeddings(self, chunks: list[dict], save_path: str):
        """Save embeddings to CSV file."""
        df = pd.DataFrame(chunks)
        df.to_csv(save_path, index=False)
        
        
    def add_to_chroma(self,chunks: list[dict]):
        ids = [str(i) for i in range(len(chunks))]
        print(chunks, 'chunks')
        documents  = [item['text'] for item in chunks]
        metadatas = [{k: v for k, v in item.items() if k != 'embedding' and k != 'sentence_chunk'} for item in chunks]
        embeddings = [item['embedding'] for item in chunks]
        
        self.collection.add(documents=documents, embeddings=embeddings, metadatas=metadatas, ids=ids)
        
    def query(self, text: str, k = 5):
        query_embedding  = self.model.encode(text, normalize_embeddings=True).tolist()
        results = self.collection.query(query_embeddings=[query_embedding], n_results=k)
        return results
    
    
    def load_from_chroma(self):
        """Load embeddings and metadata from ChromaDB."""
        data = self.collection.get(include=["embeddings", "metadatas", "documents"], limit=99999)

        if not data["ids"]:
            print("No data found in collection.")
            return None, []

        print(f"Loaded {len(data['ids'])} records from ChromaDB.")

        embeddings = np.array(data["embeddings"], dtype=np.float32)
        embeddings = torch.tensor(embeddings).to(self.device)

        pages_and_chunks = [
            {"id": i, "text": doc, **meta}
            for i, doc, meta in zip(data["ids"], data["documents"], data["metadatas"])
        ]

        return embeddings, pages_and_chunks

    
    # def load_embeddings(self, file_path: str) -> tuple[torch.Tensor, list[dict]]:
    #     """Load embeddings from CSV file."""
    #     df = pd.read_csv(file_path)
    #     df["embedding"] = df["embedding"].apply(lambda x: np.fromstring(x.strip("[]"), sep=" "))
    #     pages_and_chunks = df.to_dict(orient="records")
    #     embeddings = torch.tensor(np.array(df["embedding"].tolist()), 
    #                             dtype=torch.float32).to(self.device)
    #     return embeddings, pages_and_chunks