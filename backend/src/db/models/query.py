from pydantic import BaseModel



class QueryRequest(BaseModel):
    query: str
    pdf_id: str
    

class ConverstaionReq(BaseModel):
    pdf_id: str
   