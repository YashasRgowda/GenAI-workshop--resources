"""
Standalone script to run RAG evaluation.
Usage: python -m evaluation.run_evaluation
"""
import json
from fastapi.testclient import TestClient
from app.main import app
from core.retriever import get_retriever
from evaluation.test_dataset import TEST_CASES, SEED_DOCUMENTS
from evaluation.evaluator import run_full_evaluation

# API key for authenticated requests
AUTH_HEADERS = {"X-API-Key": "rag-sk-dev-key-2024"}


def seed_documents():
    """Add test documents to the system."""
    retriever = get_retriever()
    doc_ids = []
    
    print("\n📄 Seeding test documents...")
    for doc in SEED_DOCUMENTS:
        doc_id = retriever.add_document(
            content=doc["content"],
            valid_from=doc["valid_from"],
            valid_to=doc["valid_to"],
            source=doc["source"]
        )
        doc_ids.append(doc_id)
        print(f"  ✅ Added: {doc['source']}")
    
    return doc_ids


def cleanup_documents(doc_ids):
    """Remove test documents after evaluation."""
    retriever = get_retriever()
    
    print("\n🧹 Cleaning up test documents...")
    for doc_id in doc_ids:
        try:
            retriever.delete_document(doc_id)
        except:
            pass


def print_report(report):
    """Print a formatted evaluation report."""
    summary = report["summary"]
    
    print("\n" + "=" * 60)
    print("📊 RAG EVALUATION REPORT")
    print("=" * 60)
    
    print(f"\n📋 Test Cases: {summary['total_tests']}")
    print(f"✅ Passed: {summary['successful_runs'] - summary['failed_runs']}")
    print(f"❌ Failed: {summary['failed_runs']}")
    print(f"📈 Pass Rate: {summary['pass_rate']}%")
    
    print(f"\n--- Metrics ---")
    print(f"🎯 Keyword Match:    {summary['avg_keyword_match']}%")
    print(f"⏰ Time Relevance:   {summary['avg_time_relevance']}%")
    print(f"📄 Source Accuracy:  {summary['source_accuracy']}%")
    print(f"⚡ Avg Response:     {summary['avg_response_time_ms']}ms")
    
    print(f"\n--- Individual Results ---")
    for i, result in enumerate(report["results"]):
        status = "✅" if result["passed"] else "❌"
        print(f"\n{status} Test {i+1}: {result['description']}")
        print(f"   Query: \"{result['query']}\" (date: {result['query_date']})")
        print(f"   Keyword: {result['keyword_score']*100:.0f}% | "
              f"Time: {result['time_relevance']*100:.0f}% | "
              f"Source: {'✅' if result['source_found'] else '❌'} | "
              f"Time: {result['response_time_ms']:.0f}ms")
        if "answer_preview" in result:
            print(f"   Answer: {result['answer_preview']}")
    
    print("\n" + "=" * 60)


def main():
    print("🚀 Starting RAG Evaluation...")
    
    # Seed documents
    doc_ids = seed_documents()
    
    try:
        # Run evaluation
        with TestClient(app) as client:
            report = run_full_evaluation(client, TEST_CASES, AUTH_HEADERS)
        
        # Print report
        print_report(report)
        
        # Save report to file
        with open("evaluation/report.json", "w") as f:
            json.dump(report, f, indent=2)
        print("\n💾 Report saved to evaluation/report.json")
        
    finally:
        # Always cleanup
        cleanup_documents(doc_ids)


if __name__ == "__main__":
    main()