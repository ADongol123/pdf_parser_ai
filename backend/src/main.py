from fastapi import FastAPI, Request, UploadFile,File,HTTPException, Depends
from pydantic import BaseModel
from src.data_processing import process_pdfs
from src.embeddings import EmbeddingManager
from src.retrieval import retrieve_relevant_resources, print_results
from src.bot.mistral import create_ollama_prompt, query_ollama
from src.utils import print_wrapped
import os
from src.db.mongo import pdfs_collection,client,db
from io import BytesIO
from src.db.models.user import UserOut, UserCreate
from src.db.mongo import get_user_by_email,create_user
from fastapi.security import OAuth2PasswordRequestForm
from src.db.auth import verify_password, create_access_token, decode_access_token,get_current_user
from passlib.context import CryptContext
from bson import ObjectId
import datetime




app = FastAPI()
embedding_manager = EmbeddingManager()
embeddings = None
pages_and_chunks = None

# Request model
class QueryRequest(BaseModel):
    query: str

# @app.on_event("startup")
# def initialize_embeddings():
#     global embeddings, pages_and_chunks

#     # Try loading from Chroma
#     embeddings, pages_and_chunks = embedding_manager.load_from_chroma()

#     if embeddings is None:
#         print("Processing PDFs and generating embeddings.....")
#         df = process_pdfs("data")
#         chunks_with_embeddings = embedding_manager.generate_embeddings(df.to_dict(orient="records"))
#         embedding_manager.add_to_chroma(chunks_with_embeddings)
#         embeddings, pages_and_chunks = embedding_manager.load_from_chroma()
#         print("Embeddings initialized")

@app.get("/")
def read_root():
    return {"message":"Hello World"}


@app.post("/upload")
async def upload_pdf(file:UploadFile = File(...), current_user: UserCreate = Depends(get_current_user)):
    content = await file.read()
    
    user_id = current_user["id"]
    
    print(current_user,'current_user')
    result = await pdfs_collection.insert_one({
        "filename": file.filename,
        "content":content,
        "user_id": ObjectId(user_id),
        "timestamp": datetime.datetime.utcnow()
    })
    
    pdf_id = result.inserted_id
    
    
    # Process the PDF content directly from memory (BytersIO)
    content_io = BytesIO(content)
    df = process_pdfs(content_io)
    
    
    # Generate ans store embedddings
    chunks_with_embeddings = embedding_manager.generate_embeddings(df.to_dict(orient="records"))
    print(df)
    # Storing embeddings in MongoDB
    for chunk in chunks_with_embeddings:
        await db.embeddings.insert_one({
            "source":"pdf",
            "filename":file.filename,
            "text":chunk["text"],
            "embeddings": chunk["embedding"]
        })
        # Adding to chromaDB
        embedding_manager.add_to_chroma([chunk])
    
    return {
        'message':f"Uploaded and processed {file.filename} with embeddings. "
    }



# @app.post("/query")
# async def query_pdf(req: QueryRequest, current_user:dict = Depends(get_current_user)):
#     query = req.query
#     # Get user email or ID fro JWT payload
#     user_id = current_user["sub"] 
    
    
#     if query.lower() == "quit":
#         return {"message":"Seession ended."}
    
    
#     # Perform the query as before, bot now associate the user;s query with theit ID
#     results = retrieve_relevant_resources(
#         query=query, 
#         embeddings=embeddings, 
#         model=embedding_manager.model, 
#         pages_and_chunks=pages_and_chunks
#     )
    
#     # Embed response and store it with the user ID
#     ollama_prompt = create_ollama_prompt(query, results)
#     mistral_response = query_ollama(ollama_prompt)
    
    
#     if mistral_response:
#         # Generate embedding for the response
#         embedded_answer = embedding_manager.generate_embeddings([{
#             "text": mistral_response
#         }])

#         # Save the answer embeddings to MongoDB
#         embedding_data = {
#             "user_id": ObjectId(current_user.id),  # Associate with the current user
#             "source": "answer",
#             "text": mistral_response,
#             "embedding": embedded_answer[0]["embedding"],
#             "timestamp": datetime.utcnow()  # Timestamp for when the embedding was created
#         }

#         # Insert the generated answer embedding into MongoDB
#         await embeddings_collection.insert_one(embedding_data)

#         # Add the new answer embedding to Chroma (RAG)
#         embedding_manager.add_to_chroma([embedded_answer[0]])

#         # Update global embeddings to include the new data
#         global embeddings, pages_and_chunks
#         embeddings, pages_and_chunks = embedding_manager.load_from_chroma()

#         return {
#             "query": query,
#             "prompt": ollama_prompt,
#             "response": mistral_response
#         }

#     return {"error": "Failed to get a response from Mistral."}



# ----------------------------------------------Login and Register Section-----------------------

user_collection = db["users"]


@app.post("/register",response_model=UserOut)
async def create_user(user: UserCreate):
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    # Hash the password before saving
    hashed_password = pwd_context.hash(user.password)  # Hashing the plain password

    # Prepare user data with the hashed password
    user_data = { 
        "username": user.username, 
        "email": user.email, 
        "password": hashed_password 
    }

    # Insert the user into the database
    result = await user_collection.insert_one(user_data)
    return UserOut(id=str(result), username=user.username, email=user.email)
    


@app.post("/login")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    # Print the form data fields correctly
    print(f"Username: {form_data.username}, Password: {form_data.password}")

    # Get the user from the database based on the email
    user = await get_user_by_email(form_data.username)
    
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password (ensure verify_password compares correctly)
    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # If credentials are correct, generate the access token
    access_token = create_access_token(data={"sub": user["email"],'id':str(user["_id"])})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }  