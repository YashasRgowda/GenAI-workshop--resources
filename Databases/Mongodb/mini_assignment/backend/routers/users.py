from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# the above is password hashing logic

from fastapi import APIRouter, HTTPException
from database import user_collection
from models.user_model import UserCreate, UserResponse
from bson import ObjectId

router = APIRouter()

def user_serializer(user) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }
    
# Register User
@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    
    existing_user = await user_collection.find_one(
        {"email": user.email}
    )
    
    if existing_user: 
        raise HTTPException(
            status_code = 400,
            detail = "Email already registered"
        )
        
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    

    result = await user_collection.insert_one(user_dict)
    
    new_user = await user_collection.find_one(
        {"_id": result.inserted_id}
    )
    
    return user_serializer(new_user)


# LIST USERS
@router.get("/users")
async def list_users():
    users = []
    async for user in user_collection.find():
        users.append(user_serializer(user))
    return users