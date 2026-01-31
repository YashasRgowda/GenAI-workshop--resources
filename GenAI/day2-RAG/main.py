import os
import numpy as np
from fastapi import FastAPI
from dotenv import load_dotenv
from google import genai
from sentence_transformers import SentenceTransformer

from ingest import load_and_embed_documents
from vector_store import build_index

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

# Load RAG components at startup
chunks, vectors = load_and_embed_documents()
index = build_index(vectors)

embedder = SentenceTransformer("all-MiniLM-L6-v2")


@app.post("/ask")
def ask(question: str):
    query_vector = embedder.encode(
        question,
        convert_to_numpy=True,
        normalize_embeddings=True
    ).astype("float32")

    _, indices = index.search(
        np.array([query_vector]),
        k=3
    )

    context = "\n".join([chunks[i] for i in indices[0]])

    prompt = f"""
Answer ONLY using the context below.
If not present, say "Not found in context".

Context:
{context}

Question:
{question}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return {"answer": response.text}