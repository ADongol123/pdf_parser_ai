from fastapi import FastAPI, Request, UploadFile,File,status,HTTPException, Depends,Query
from pydantic import BaseModel
from src.data_processing import process_pdfs
from src.embeddings import EmbeddingManager
from src.retrieval import retrieve_relevant_resources, print_results
from src.bot.mistral import create_ollama_prompt, query_ollama
from src.utils import print_wrapped,is_meta_question,fs
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
from src.db.models.query import QueryRequest,ConverstaionReq
from fastapi.middleware.cors import CORSMiddleware
from bson.json_util import dumps, loads
from fastapi.responses import JSONResponse
from src.meta_data import META_QUESTION_PHRASES
from src.utils import get_pdf_metadata
from fastapi.responses import FileResponse
from fastapi.responses import StreamingResponse
import tempfile
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from fastapi.responses import Response
import warnings

warnings.filterwarnings("ignore", category=FutureWarning)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
embedding_manager = EmbeddingManager()
embeddings = None
pages_and_chunks = None


def serialize_conversation(convo):
    return {
        "_id": str(convo["_id"]),
        "user_id": str(convo["user_id"]),
        "pdf_id": str(convo["pdf_id"]),
        "query": convo.get("query", ""),
        "response": convo.get("response", ""),
        # "timestamp": convo["timestamp"].isoformat() if isinstance(convo["timestamp"], datetime) else convo["timestamp"],
    }




@app.get("/")
def read_root():
    return {"message":"Hello World"}


@app.post("/upload")
async def upload_pdf(file:UploadFile = File(...), current_user: UserCreate = Depends(get_current_user)):
    content = await file.read()
    user_id = current_user["id"]
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
    # Storing embeddings in MongoDB
    for chunk in chunks_with_embeddings:
        await db.embeddings.insert_one({
            "source":"pdf",
            "filename":file.filename,
            "text":chunk["text"],
            "embeddings": chunk["embedding"],
            "user_id":ObjectId(user_id),
            "pdf_id": ObjectId(pdf_id),
            "timestamp": datetime.datetime.utcnow()
        })
        # Adding to chromaDB
        embedding_manager.add_to_chroma([chunk])
    
    return {
        "pdf_id": str(pdf_id),
        'message':f"Uploaded and processed {file.filename} with embeddings. "
    }



@app.post("/query")
async def query_pdf(req: QueryRequest, current_user: dict = Depends(get_current_user)):
    embeddings_collection = db["embeddings"]
    query = req.query
    pdf_id = req.pdf_id  
    user_id = current_user["id"]
    pdf_obj_id = ObjectId(pdf_id)
    
    if is_meta_question(query):
        conversations = await db['conversations'].find({
            "user_id": ObjectId(user_id),
            "pdf_id": pdf_obj_id
        }).sort("timestamp", 1).to_list(length=None)

        if conversations:
            first_q = conversations[0]["query"]
            return {"response": f"Your first question was: \"{first_q}\""}
        else:
            return {"response": "You haven't asked any questions yet."}
        
    print(user_id,'user_id')
    
    # print(user_id,'user_id')
    if query.lower() == "quit":
        return {"message": "Session ended."}

    # Step 1: Fetch user-specific embeddings for the given PDF
    embedding_docs = await embeddings_collection.find({ 
        "user_id": ObjectId(user_id),
        "pdf_id": ObjectId(pdf_id),
        "source": "pdf" 
    },max_time_ms = 5000).to_list(length=None)

    if embedding_docs:
        print('Embeddings Created')
    if not embedding_docs:
        return {"error": "No embeddings found for this PDF and user."}

    # Step 2: Prepare data for retrieval
    user_embeddings = [doc["embeddings"] for doc in embedding_docs]
    user_chunks = [doc["text"] for doc in embedding_docs]

    pages_and_chunks = [{"text": text} for text in user_chunks]

    # Step 3: Retrieve relevant resources
    results = retrieve_relevant_resources(
        query=query,
        embeddings=user_embeddings,
        model=embedding_manager.model,
        pages_and_chunks=pages_and_chunks
    )
    print(results, 'results')
    # Step 4: Generate response
    ollama_prompt = create_ollama_prompt(query, results)
    mistral_response = query_ollama(ollama_prompt)

    if mistral_response:
        # Step 5: Generate embeddings for the response
        embedded_answer = embedding_manager.generate_embeddings([{
            "text": mistral_response
        }])

        embedding_data = {
            "user_id": ObjectId(user_id),
            "pdf_id": ObjectId(pdf_id), 
            "source": "answer",
            "text": mistral_response,
            "embedding": embedded_answer[0]["embedding"],
            "timestamp": datetime.datetime.utcnow()
        }

        await embeddings_collection.insert_one(embedding_data)

        # Add new embedding to Chroma (optional if using external vector DB)
        embedding_manager.add_to_chroma([embedded_answer[0]])
        
        converstaion_data = {
            "user_id": ObjectId(user_id),
            "pdf_id" : ObjectId(pdf_id),
            "query": query,
            "response": mistral_response,
            "embeddings": embedded_answer[0]["embedding"],
            "timestamp": datetime.datetime.utcnow()
        }
        await db['conversations'].insert_one(converstaion_data)
        return {
            "query": query,
            "prompt": ollama_prompt,
            "response": mistral_response
        }

    return {"error": "Failed to get a response from Mistral."}

@app.get("/conversations")
async def get_conversations(
    pdf_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    conversations_collection = db["conversations"]

    cursor = conversations_collection.find({
        "user_id": ObjectId(user_id),
        "pdf_id": ObjectId(pdf_id)
    })

    conversations = await cursor.to_list(length=None)
    
    # Convert each document to JSON-serializable format
    serialized_conversations = [serialize_conversation(doc) for doc in conversations]

    return serialized_conversations



@app.post("/extract")
async def extract_topics_from_db(pdf_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    embeddings_collection = db["embeddings"]

    # Step 1: Fetch stored chunks for this user & PDF
    embedding_docs = await embeddings_collection.find({
        "user_id": ObjectId(user_id),
        "pdf_id": ObjectId(pdf_id),
        "source": "pdf"
    }, max_time_ms=5000).to_list(length=None)

    if not embedding_docs:
        return {"error": "No data found for this PDF."}

    # Step 2: Grab the text chunks
    all_text_chunks = [doc["text"] for doc in embedding_docs]
    combined_text = " ".join(all_text_chunks)
    short_text = combined_text[:4000]  

    # Step 3: Create prompt for Mistral
    prompt = f"""
    Analyze the following document content and identify 5–10 high-level topics or themes discussed in it.
    Respond only with a numbered list of topic names.

    Document Content:
    {short_text}
    """

    # Step 4: Query Mistral
    response = query_ollama(prompt)

    return {
        "topics": response.split("\n") if response else [],
        "raw_response": response
    }

# ----------------------------------------------Chat Room Section-----------------------
@app.post("/create_chat_rooms")
async def create_chat(title: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    # Check if a chat room with the same title already exists for this user
    existing_chat = await db["chat_rooms"].find_one({
        "user_id": ObjectId(user_id),
        "title": title
    })

    if existing_chat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat room with this title already exists."
        )

    # If not exists, create new chat room
    chat_data = {
        "user_id": ObjectId(user_id),
        "title": title,
        "timestamp": datetime.datetime.utcnow()
    }
    result = await db["chat_rooms"].insert_one(chat_data)
    return {"chat_id": str(result.inserted_id)}


@app.get("/get_chat_rooms")
async def get_chat_rooms(current_user:dict = Depends(get_current_user)):
    user_id = current_user["id"]
    chat_rooms = await db["chat_rooms"].find({"user_id": ObjectId(user_id)}).to_list(length=None)
    return [{"chat_id": str(room["_id"]), "title": room["title"], "timestamp":room["timestamp"]} for room in chat_rooms]
    



@app.get("/pdf/{pdf_id}")
async def get_pdf_file(
    pdf_id: str,
    current_user: dict = Depends(get_current_user)
):
    pdf_collection = db["pdfs"]

    # Fetch the PDF document from MongoDB
    pdf_doc = await pdf_collection.find_one({
        "_id": ObjectId(pdf_id),
        "user_id": ObjectId(current_user["id"])
    })

    if not pdf_doc:
        raise HTTPException(status_code=404, detail="PDF not found or unauthorized access")

    pdf_content = pdf_doc["content"]
    filename = pdf_doc.get("filename", "document.pdf")

    return StreamingResponse(
        BytesIO(pdf_content),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )
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
        "user_id": str(user["_id"]),
        "token_type": "bearer"
    }  
    
    
    
    #-----------------------------------------------Meta Data Section --------------------------


@app.post("/save-meta-phrases")
async def save_phrases():
    await db["meta_question_phrases"].delete_many({})  # clear old data if needed

    records = [
        {"category": category, "phrases": phrases}
        for category, phrases in META_QUESTION_PHRASES.items()
    ]

    result = await db["meta_question_phrases"].insert_many(records)
    return {"inserted_ids": [str(_id) for _id in result.inserted_ids]}
