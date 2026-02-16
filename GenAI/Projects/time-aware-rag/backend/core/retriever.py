from typing import List, Dict, Tuple
from core.embeddings import get_embedding_model
from core.vector_store import get_vector_store
from core.metadata_store import get_metadata_store
from datetime import datetime, timedelta
from collections import defaultdict
from core.logger import get_logger
logger = get_logger("retriever")

class TimeAwareRetriever:
    def __init__(self):
        self.embedder = get_embedding_model()
        self.vector_store = get_vector_store()
        self.metadata_store = get_metadata_store()
        logger.info("TimeAwareRetriever initialized")
    
    def add_document(
        self,
        content: str,
        valid_from: str,
        valid_to: str,
        source: str = None,
        metadata: dict = None
    ) -> str:
        """
        Add a document to the system
        
        Args:
            content: Document text
            valid_from: Start date (YYYY-MM-DD)
            valid_to: End date (YYYY-MM-DD)
            source: Source reference
            metadata: Additional metadata
            
        Returns:
            doc_id: Document ID
        """
        # 1. Add to metadata store
        doc_id = self.metadata_store.add_document(
            content=content,
            valid_from=valid_from,
            valid_to=valid_to,
            source=source,
            metadata=metadata
        )
        
        # 2. Generate embedding
        embedding = self.embedder.encode(content)
        
        # 3. Add to vector store
        self.vector_store.add_vectors(embedding, [doc_id])
        
        # 4. Save both stores
        self.metadata_store.save()
        self.vector_store.save()
        
        logger.info(f"Document added successfully: {doc_id[:8]}...")
        return doc_id
    
    
    def add_documents_batch(
        self,
        documents: List[Dict]
    ) -> Dict:
        """
        Add multiple documents in batch.
        More efficient than adding one by one.
        
        Args:
            documents: List of document dictionaries with keys:
                    content, valid_from, valid_to, source, metadata

        Returns:
            Dictionary with success/failure statistics
        """
        logger.info(f"\nBatch upload: Processing {len(documents)} documents...")

        results = {
            "successful": 0,
            "failed": 0,
            "doc_ids": [],
            "errors": []
        }
    
        # Collect all documents for batch processing
        all_embeddings = []
        all_doc_ids = []
        metadata_batch = []
    
        for idx, doc in enumerate(documents):
            try:
                # 1. Add to metadata store
                doc_id = self.metadata_store.add_document(
                    content=doc["content"],
                    valid_from=doc["valid_from"],
                    valid_to=doc["valid_to"],
                    source=doc.get("source"),
                    metadata=doc.get("metadata")
                )
                
                # 2. Generate embedding
                embedding = self.embedder.encode(doc["content"])
                
                # Collect for batch FAISS insert
                all_embeddings.append(embedding)
                all_doc_ids.append(doc_id)
                
                results["successful"] += 1
                results["doc_ids"].append(doc_id)
                
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({
                    "index": idx,
                    "content_preview": doc["content"][:50],
                    "error": str(e)
                })
                logger.info(f"Error processing document {idx}: {e}")
    
        # 3. Batch insert into FAISS (much faster than one-by-one)
        if all_embeddings:
            import numpy as np
            embeddings_array = np.vstack(all_embeddings)
            self.vector_store.add_vectors(embeddings_array, all_doc_ids)
        
        # 4. Save stores
        self.metadata_store.save()
        self.vector_store.save()
        
        logger.info(f"Batch complete: {results['successful']} successful, {results['failed']} failed")
        return results
    
    
    def retrieve(
        self,
        query: str,
        query_date: str,
        k: int = 5
    ) -> Tuple[List[Dict], List[float]]:
        """
        Time-aware retrieval
        
        Args:
            query: Search query
            query_date: Date context (YYYY-MM-DD)
            k: Number of results
            
        Returns:
            Tuple of (documents, scores)
        """
        logger.info(f"\nRetrieving for query: '{query}' on date: {query_date}")
        
        # 1. Embed query
        query_embedding = self.embedder.encode(query)
        
        # 2. Get top candidates from FAISS (get more than k for filtering)
        search_k = min(k * 3, self.vector_store.index.ntotal) if self.vector_store.index else k
        distances, candidate_ids = self.vector_store.search(query_embedding, k=search_k)
        
        if not candidate_ids:
            logger.info("No candidates found in vector store")
            return [], []
        
        logger.info(f"Retrieved {len(candidate_ids)} candidates from vector store")
        
        # 3. Get metadata for candidates
        candidates = self.metadata_store.filter_by_ids(candidate_ids)
        
        # 4. Filter by time validity
        valid_docs = []
        valid_scores = []
        
        for doc, distance in zip(candidates, distances):
            if doc["valid_from"] <= query_date <= doc["valid_to"]:
                valid_docs.append(doc)
                # Convert L2 distance to similarity score (lower is better)
                valid_scores.append(float(distance))
        
        # 5. Sort by score and limit to k
        sorted_pairs = sorted(zip(valid_docs, valid_scores), key=lambda x: x[1])
        valid_docs = [doc for doc, _ in sorted_pairs[:k]]
        valid_scores = [score for _, score in sorted_pairs[:k]]
        
        logger.info(f"Found {len(valid_docs)} time-valid documents")
        
        return valid_docs, valid_scores
    
    def get_all_documents(self) -> List[Dict]:
        """Get all documents"""
        return self.metadata_store.get_all_documents()
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document (metadata only, FAISS cleanup requires rebuild)"""
        success = self.metadata_store.delete_document(doc_id)
        if success:
            self.metadata_store.save()
        return success
    
    def retrieve_date_range(
        self,
        query: str,
        start_date: str,
        end_date: str,
        k: int = 10
    ) -> Dict:
        """
        Retrieve documents across a date range.
        Groups results by time period (yearly).
        
        Args:
            query: Search query
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            k: Max results per period
            
        Returns:
            Dictionary with documents grouped by year
        """
        logger.info(f"\nDate Range Retrieval: {start_date} to {end_date}")
        
        # Parse dates
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        
        # Generate yearly periods
        periods = []
        current_year = start.year
        while current_year <= end.year:
            periods.append({
                "year": current_year,
                "start": f"{current_year}-01-01",
                "end": f"{current_year}-12-31",
                "label": str(current_year)
            })
            current_year += 1
        
        # Retrieve for each period (using mid-year date)
        results_by_period = {}
        all_documents = []
        
        for period in periods:
            query_date = f"{period['year']}-06-15"
            
            docs, scores = self.retrieve(
                query=query,
                query_date=query_date,
                k=k
            )
            
            results_by_period[period['label']] = {
                "documents": docs,
                "scores": scores,
                "count": len(docs)
            }
            
            all_documents.extend(docs)
        
        logger.info(f"Found {len(all_documents)} total documents across {len(periods)} periods")
        
        return {
            "periods": periods,
            "results_by_period": results_by_period,
            "total_documents": len(all_documents),
            "unique_documents": len(set(d["doc_id"] for d in all_documents))
        }


    def compare_policy_versions(
        self,
        topic: str,
        start_date: str,
        end_date: str
    ) -> Dict:
        """
        Compare different versions of a policy across time.
        
        Args:
            topic: Policy topic to compare
            start_date: Start date
            end_date: End date
            
        Returns:
            Dictionary with policy versions and changes
        """
        logger.info(f"\nComparing '{topic}' from {start_date} to {end_date}")
        
        # Get all relevant documents across date range
        range_results = self.retrieve_date_range(
            query=topic,
            start_date=start_date,
            end_date=end_date,
            k=5
        )
        
        # Collect all unique documents
        all_docs = []
        seen_ids = set()
        
        for period_label, period_data in range_results["results_by_period"].items():
            for doc in period_data["documents"]:
                if doc["doc_id"] not in seen_ids:
                    all_docs.append(doc)
                    seen_ids.add(doc["doc_id"])
        
        # Sort by valid_from date
        all_docs.sort(key=lambda x: x["valid_from"])
        
        # Create versions list
        versions = []
        for idx, doc in enumerate(all_docs):
            versions.append({
                "version_number": idx + 1,
                "doc_id": doc["doc_id"],
                "source": doc["source"],
                "valid_from": doc["valid_from"],
                "valid_to": doc["valid_to"],
                "content_preview": doc["content"][:300] + "..." if len(doc["content"]) > 300 else doc["content"]
            })
        
        logger.info(f"Found {len(versions)} versions of '{topic}'")
        
        return {
            "topic": topic,
            "versions": versions,
            "total_versions": len(versions),
            "date_range": {
                "start": start_date,
                "end": end_date
            }
        }

# Singleton instance
_retriever = None

def get_retriever() -> TimeAwareRetriever:
    """Get or create retriever singleton"""
    global _retriever
    if _retriever is None:
        _retriever = TimeAwareRetriever()
    return _retriever