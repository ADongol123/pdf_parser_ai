from langchain_ollama import OllamaLLM
from langchain.prompts import PromptTemplate

MISTRAL_MODEL = "mistral"

def create_ollama_prompt(query: str, relevant_resources: list[dict], history: list[dict] = None):
    """Create a prompt for the Ollama/Mistral model using Langchain PromptTemplate and optional history."""
    
    template = """You are **DocuMate**, a knowledgeable and friendly assistant designed to help users understand content from a specific PDF document.

    Your role is to answer questions using *only* the provided PDF snippets. Do not use outside knowledge or make assumptions.

    Document Snippets:
    {context}

    Conversation History:
    {history}

    Now, answer the following question based *only* on the information within the snippets and the context above. 
    If the answer cannot be found, respond with:
    "I'm sorry, but the answer to your question cannot be found in the provided document snippets."

    Question: {question}
    """

    # Combine previous Q&A pairs into a string
    history_str = ""
    if history:
        history_str = "\n".join([f"User: {h['query']}\nAI: {h['response']}" for h in history])

    context = "\n".join([res["text"] for res in relevant_resources])
    
    prompt = PromptTemplate(
        template=template, input_variables=["context", "history", "question"]
    )
    return prompt.format(context=context, history=history_str, question=query)



def query_ollama(prompt: str, model_name: str = MISTRAL_MODEL):
    """Queries the local Ollama model using Langchain."""
    llm = OllamaLLM(model=model_name)
    return llm(prompt)