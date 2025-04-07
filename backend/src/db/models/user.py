from pydantic import BaseModel


class UserBase(BaseModel):
    id:str
    username: str
    email: str
    


class UserCreate(UserBase):
    password: str
    
    
class UserOut(UserBase):
    id: str
    
    
    