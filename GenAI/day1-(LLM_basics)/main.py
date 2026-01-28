from fastapi import FastAPI 
from pydantic import BaseModel 
import google.generativeai as genai 
import os 
from dotenv import load_dotenv 

load_dotenv() 

app = FastAPI() 

genai.configure(api_key=os.getenv("GEMINI_API_KEY")) 

model = genai.GenerativeModel( 
    model_name="models/gemini-2.5-flash", 
    generation_config={
        "temperature": 0.2 
    } 
) 

class CodeInput(BaseModel): 
    code: str 
    temperature: float = 0.2

@app.post("/analyze") 
def analyze_code(payload: CodeInput): 
    response = model.generate_content( 
        contents=[ 
            "You are a senior backend engineer doing a strict code review.", 
            f"Review this code and find issues:\n\n{payload.code}" 
        ], 
        generation_config={ 
            "temperature": payload.temperature 
        } 
    ) 
    
    return { 
        "analysis": response.text 
    } 