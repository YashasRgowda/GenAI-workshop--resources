from fastapi import APIRouter, Depends
from dependencies.common import get_app_info, verify_token

router = APIRouter(
    prefix = "/students",
    tags = ["Students"]
)

@router.get("/info")
def app_info(info = Depends(get_app_info)):
    return info

@router.get("/secure")
def secure_students(user = Depends(verify_token)):
    return {
        "message": "Access granted",
        "user": user
    }
    

