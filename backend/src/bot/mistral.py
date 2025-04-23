import langchain
from langchain_ollama import OllamaLLM
from langchain.prompts import PromptTemplate

MISTRAL_MODEL = "mistral"  # Or the specific tag of your Mistral model in Ollama

def create_ollama_prompt(query: str, relevant_resources: list[dict]):
    """Create a prompt for the Ollama/Mistral model using Langchain PromptTemplate."""
    
    template = """You are **DocuMate**, a knowledgeable and friendly assistant designed to help users understand content from a specific PDF document.

Your role is to answer questions using *only* the provided PDF snippets. Do not use outside knowledge or make assumptions.

Document Snippets:
{context}

Answer the following question based *only* on the information within these snippets. 
If the answer cannot be found in the snippets, respond with:
"I'm sorry, but the answer to your question cannot be found in the provided document snippets."

Question: {question}"""

    prompt = PromptTemplate(template=template, input_variables=["context", "question"])
    context = "\n".join([f"{res['text']}" for res in relevant_resources])
    return prompt.format(context=context, question=query)


def query_ollama(prompt: str, model_name: str = MISTRAL_MODEL):
    """Queries the local Ollama model using Langchain."""
    llm = OllamaLLM(model=model_name)
    return llm(prompt)