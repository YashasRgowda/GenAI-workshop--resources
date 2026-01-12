from fastapi import HTTPException, status

def verify_token(token: str | None = None):
    if token != "secret123":
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Invalid or missing token"
        )
    return {"user": "admin"}

def get_app_info(): 
   return { 
       "app": "Student API", 
       "version": "1.0" 
   }