from fastapi import APIRouter

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/")
def get_students(): 
   return [ 
       {"id": 1, "name": "Alex", "email": "alex@mail.com"}, 
       {"id": 2, "name": "Sam", "email": "sam@mail.com"}, 
       {"id": 3, "name": "Riya", "email": "riya@mail.com"}, 
   ] 