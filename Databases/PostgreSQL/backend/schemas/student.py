from pydantic import BaseModel 
 
class StudentCreate(BaseModel): 
   name: str 
   age: int 
   email: str 
 
class StudentResponse(BaseModel): 
   id: int 
   name: str 
   age: int 
   email: str 
 
   class Config: 
       from_attributes = True 
