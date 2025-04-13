from pydantic import BaseModel


class UserBase(BaseModel):
    id:str
    username: str
    email: str
    

class RegisterBase(BaseModel):
    username:str
    email:str

class UserCreate(RegisterBase):
    password: str
    
    
class UserOut(UserBase):
    id: str
    
    
    