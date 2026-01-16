from fastapi import FastAPI
from routers import students

app = FastAPI(title="Student Management API")

app.include_router(students.router)