import numpy as np
from sentence_transformers import SentenceTransformer

# Load once (important)
model = SentenceTransformer("all-MiniLM-L6-v2")


def chunk_text(text, chunk_size=200):
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)

    return chunks



def load_and_embed_documents():
    with open("documents/utils.py", "r") as file:
        text = file.read()

    chunks = chunk_text(text)
    embeddings = model.encode(
        chunks,
        convert_to_numpy = True,
        normalize_embeddings = True
    )

    return chunks, embeddings.astype("float32")
