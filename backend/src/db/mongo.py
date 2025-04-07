from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI
from src.db.models.user import UserCreate
import bcrypt
from bson import ObjectId

MONGO_URI = MONGO_URI
client = AsyncIOMotorClient(MONGO_URI)
db = client['pdf_parser_db']
pdfs_collection = db["pdfs"]
user_collection = db["users"]




async def create_user(user: UserCreate):
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": user.password
    }
    
    result = await user_collection.insert_one(user_data)
    return str(result.inserted_id)



async def get_user_by_email(email:str):
    return await user_collection.find_one({"email":email})


async def get_user_by_id(user_id:str):
    return await user_collection.find_one({"_id": ObjectId(user_id)})



