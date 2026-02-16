import google.generativeai as genai
from typing import List, Dict
from app.config import get_settings
from core.logger import get_logger
logger = get_logger("gemini")

class GeminiClient:
    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        
        # Use Gemini 2.5 Flash (latest and fastest)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        logger.info("Gemini client initialized with gemini-2.5-flash")
    
    def generate_answer(
        self,
        query: str,
        context_docs: List[Dict],
        query_date: str
    ) -> str:
        """
        Generate answer using retrieved context
        
        Args:
            query: User's question
            context_docs: Retrieved documents
            query_date: Date context
            
        Returns:
            Generated answer
        """
        # Build context from documents
        if not context_docs:
            return "I couldn't find any relevant information in the valid documents for the specified date."
        
        context_text = "\n\n".join([
            f"Document {i+1} (Valid: {doc['valid_from']} to {doc['valid_to']}):\n{doc['content']}"
            for i, doc in enumerate(context_docs)
        ])
        
        # Create prompt
        prompt = f"""You are a helpful assistant that answers questions based ONLY on the provided context documents.

Current Date Context: {query_date}

Context Documents:
{context_text}

User Question: {query}

Instructions:
1. Answer based ONLY on the information in the provided documents
2. If the documents don't contain enough information to answer, say "The provided documents don't contain sufficient information to answer this question."
3. Be concise and direct
4. If multiple documents have conflicting information, mention the validity periods
5. Do not make up information or use knowledge outside the provided context

Answer:"""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.info(f"Error generating answer: {e}")
            return f"Error generating answer: {str(e)}"

# Singleton instance
_gemini_client = None

def get_gemini_client() -> GeminiClient:
    """Get or create Gemini client singleton"""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client