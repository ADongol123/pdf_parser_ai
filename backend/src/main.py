import os
from data_processing import process_pdfs
from embeddings import EmbeddingManager
from retrieval import retrieve_relevant_resources, print_results
from bot.mistral import create_ollama_prompt, query_ollama

# def main():
#     # Configuration
#     DATA_DIR = "../data"
#     # EMBEDDINGS_PATH = "../models/text_chunks_and_embeddings_df.csv"
    
#     # Process PDFs if embeddings don't exist
#     if not os.path.exists(EMBEDDINGS_PATH):
#         print("Processing PDFs...")
#         df = process_pdfs(DATA_DIR)
        
#         # Generate and save embeddings
#         embedding_manager = EmbeddingManager()
#         chunks_with_embeddings = embedding_manager.generate_embeddings(df.to_dict(orient="records"))
#         embedding_manager.save_embeddings(chunks_with_embeddings, EMBEDDINGS_PATH)
    
#     # Load embeddings
#     embedding_manager = EmbeddingManager()
#     embeddings, pages_and_chunks = embedding_manager.load_embeddings(EMBEDDINGS_PATH)
    
#     # Interactive query loop
#     while True:
#         query = input("Enter your question about the PDFs (or 'quit' to exit): ")
#         if query.lower() == 'quit':
#             break
            
#         results = retrieve_relevant_resources(
#             query=query,
#             embeddings=embeddings,
#             model=embedding_manager.model,
#             pages_and_chunks=pages_and_chunks
#         )
#         print_results(query, results)

# if __name__ == "__main__":
#     main()


def main():
    # Configuration
    DATA_DIR = "../data"
    
    
    # Initialize EmbeddingManager
    embedding_manager = EmbeddingManager()
    
    # Check if data already exits in the Chroma
    embeddings, page_and_chunks = embedding_manager.load_from_chroma()
    
    if embeddings is None:
        print("Processing PDFs and generating embeddings.....")
        df  = process_pdfs(DATA_DIR)
        
        # Generate Embeddings
        chunks_with_embeddings = embedding_manager.generate_embeddings(df.to_dict(orient="records"))
        
        # Save to ChromaDB
        embedding_manager.add_to_chroma(chunks_with_embeddings)
        
        # Reload embeddings from ChromaDB
        embeddings, pages_and_chunks = embedding_manager.load_from_chroma()
        print("Embeddings", embeddings)
        
        
    
    while True:
        query = input("Enter your questoin about the PDFs (or 'quit' to exit): ")
        if query.lower() == 'quit':
            break
            
        
        results = retrieve_relevant_resources(
            query=query,
            embeddings=embeddings,
            model=embedding_manager.model,
            pages_and_chunks=pages_and_chunks
        )
        
        print_results(query, results)
        
        # Create prompt for Ollama/Mistral
        ollama_prompt = create_ollama_prompt(query, results)
        print("\nGenerated Prompt for Mistral:")
        from utils import print_wrapped
        print_wrapped(ollama_prompt)

        # Query the local Mistral model using Langchain via ollama_interface
        print("\nAsking Mistral using Langchain...")
        mistral_response = query_ollama(ollama_prompt)

        if mistral_response:
            print("\nMistral's Answer:")
            print_wrapped(mistral_response)
        else:
            print("Failed to get a response from Mistral via Langchain.")
if __name__ == "__main__":
    main()