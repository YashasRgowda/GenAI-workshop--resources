from fastapi import FastAPI 
from database import engine 
from models.student import Student 
from routers import students

app = FastAPI() 
 
Student.metadata.create_all(bind=engine)

app.include_router(students.router)