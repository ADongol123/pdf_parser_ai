import os
from data_processing import process_pdfs
from embeddings import EmbeddingManager
from retrieval import retrieve_relevant_resources, print_results

def main():
    # Configuration
    DATA_DIR = "../data"
    EMBEDDINGS_PATH = "../models/text_chunks_and_embeddings_df.csv"
    
    # Process PDFs if embeddings don't exist
    if not os.path.exists(EMBEDDINGS_PATH):
        print("Processing PDFs...")
        df = process_pdfs(DATA_DIR)
        
        # Generate and save embeddings
        embedding_manager = EmbeddingManager()
        chunks_with_embeddings = embedding_manager.generate_embeddings(df.to_dict(orient="records"))
        embedding_manager.save_embeddings(chunks_with_embeddings, EMBEDDINGS_PATH)
    
    # Load embeddings
    embedding_manager = EmbeddingManager()
    embeddings, pages_and_chunks = embedding_manager.load_embeddings(EMBEDDINGS_PATH)
    
    # Interactive query loop
    while True:
        query = input("Enter your question about the PDFs (or 'quit' to exit): ")
        if query.lower() == 'quit':
            break
            
        results = retrieve_relevant_resources(
            query=query,
            embeddings=embeddings,
            model=embedding_manager.model,
            pages_and_chunks=pages_and_chunks
        )
        print_results(query, results)

if __name__ == "__main__":
    main()