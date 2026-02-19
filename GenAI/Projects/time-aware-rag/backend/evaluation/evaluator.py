"""
RAG Evaluation Engine
Measures retrieval accuracy, time relevance, answer quality, and response time.
"""
import time
from typing import Dict, List
from core.logger import get_logger

logger = get_logger("evaluator")


def calculate_keyword_match(answer: str, expected_keywords: list) -> float:
    """
    Calculate what percentage of expected keywords appear in the answer.
    
    Example:
        answer = "Employees must use VPN with multi-factor auth"
        expected = ["vpn", "multi-factor", "globalprotect"]
        Result: 2/3 = 0.667 (vpn and multi-factor found, globalprotect missing)
    """
    if not expected_keywords:
        return 1.0  # No keywords expected = automatic pass
    
    answer_lower = answer.lower()
    matches = sum(1 for kw in expected_keywords if kw.lower() in answer_lower)
    return matches / len(expected_keywords)


def check_time_relevance(sources: list, query_date: str) -> float:
    """
    Check what percentage of retrieved documents are valid for the query date.
    
    Example:
        query_date = "2024-06-15"
        doc valid_from="2024-01-01", valid_to="2024-12-31" → ✅
        doc valid_from="2022-01-01", valid_to="2022-12-31" → ❌
        Result: 1/2 = 0.50
    """
    if not sources:
        return 1.0  # No sources = no time violation
    
    valid_count = 0
    for source in sources:
        valid_from = source.get("valid_from", "")
        valid_to = source.get("valid_to", "")
        
        if valid_from and valid_to:
            if valid_from <= query_date <= valid_to:
                valid_count += 1
        else:
            valid_count += 1  # If no dates, assume valid
    
    return valid_count / len(sources)


def check_source_relevance(sources: list, expected_source: str) -> bool:
    """
    Check if the expected source document was retrieved.
    
    Example:
        sources = [{"source": "vpn_policy_2024.pdf"}, {"source": "leave_policy.pdf"}]
        expected_source = "vpn_policy"
        Result: True (vpn_policy found in vpn_policy_2024.pdf)
    """
    if not expected_source:
        return True  # No specific source expected
    
    for source in sources:
        if expected_source.lower() in source.get("source", "").lower():
            return True
    return False


def evaluate_single_query(client, query_data: dict, auth_headers: dict) -> Dict:
    """
    Run a single evaluation query and measure all metrics.
    
    Returns dict with:
    - keyword_score: float (0-1)
    - time_relevance: float (0-1)
    - source_found: bool
    - response_time_ms: float
    - passed: bool
    """
    start_time = time.time()
    
    response = client.post("/api/query", json={
        "query": query_data["query"],
        "query_date": query_data["query_date"],
        "k": 5
    }, headers=auth_headers)
    
    response_time = (time.time() - start_time) * 1000  # Convert to ms
    
    if response.status_code != 200:
        return {
            "query": query_data["query"],
            "query_date": query_data["query_date"],
            "description": query_data["description"],
            "status": "error",
            "status_code": response.status_code,
            "keyword_score": 0.0,
            "time_relevance": 0.0,
            "source_found": False,
            "response_time_ms": round(response_time, 2),
            "passed": False
        }
    
    data = response.json()
    answer = data.get("answer", "")
    sources = data.get("sources", [])
    
    # Calculate metrics
    keyword_score = calculate_keyword_match(answer, query_data["expected_keywords"])
    time_relevance = check_time_relevance(sources, query_data["query_date"])
    source_found = check_source_relevance(sources, query_data["expected_source"])
    
    # A query passes if keyword match > 50% and time relevance > 80%
    passed = keyword_score >= 0.5 and time_relevance >= 0.8
    
    return {
        "query": query_data["query"],
        "query_date": query_data["query_date"],
        "description": query_data["description"],
        "status": "success",
        "answer_preview": answer[:150] + "..." if len(answer) > 150 else answer,
        "retrieved_count": len(sources),
        "keyword_score": round(keyword_score, 3),
        "time_relevance": round(time_relevance, 3),
        "source_found": source_found,
        "response_time_ms": round(response_time, 2),
        "passed": passed
    }


def run_full_evaluation(client, test_cases: list, auth_headers: dict) -> Dict:
    """
    Run all test cases and generate a summary report.
    """
    results = []
    
    for i, test_case in enumerate(test_cases):
        logger.info(f"Running evaluation {i+1}/{len(test_cases)}: {test_case['description']}")
        result = evaluate_single_query(client, test_case, auth_headers)
        results.append(result)
    
    # Calculate summary metrics
    successful = [r for r in results if r["status"] == "success"]
    
    if successful:
        avg_keyword = sum(r["keyword_score"] for r in successful) / len(successful)
        avg_time_rel = sum(r["time_relevance"] for r in successful) / len(successful)
        avg_response = sum(r["response_time_ms"] for r in successful) / len(successful)
        source_accuracy = sum(1 for r in successful if r["source_found"]) / len(successful)
        pass_rate = sum(1 for r in successful if r["passed"]) / len(successful)
    else:
        avg_keyword = avg_time_rel = avg_response = source_accuracy = pass_rate = 0.0
    
    return {
        "summary": {
            "total_tests": len(test_cases),
            "successful_runs": len(successful),
            "failed_runs": len(test_cases) - len(successful),
            "pass_rate": round(pass_rate * 100, 1),
            "avg_keyword_match": round(avg_keyword * 100, 1),
            "avg_time_relevance": round(avg_time_rel * 100, 1),
            "source_accuracy": round(source_accuracy * 100, 1),
            "avg_response_time_ms": round(avg_response, 2),
        },
        "results": results
    }