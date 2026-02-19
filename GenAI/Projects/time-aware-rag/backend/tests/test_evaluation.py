"""
Tests for RAG Evaluation System
"""
import pytest
from evaluation.evaluator import calculate_keyword_match, check_time_relevance, check_source_relevance


def test_keyword_match_all():
    """Test keyword match when all keywords found."""
    answer = "Employees must use VPN with multi-factor authentication via GlobalProtect"
    keywords = ["vpn", "multi-factor", "globalprotect"]
    score = calculate_keyword_match(answer, keywords)
    assert score == 1.0


def test_keyword_match_partial():
    """Test keyword match when some keywords found."""
    answer = "Employees must use VPN for remote access"
    keywords = ["vpn", "multi-factor", "globalprotect"]
    score = calculate_keyword_match(answer, keywords)
    assert score == pytest.approx(1/3, rel=0.01)


def test_keyword_match_none():
    """Test keyword match when no keywords found."""
    answer = "The weather is nice today"
    keywords = ["vpn", "multi-factor", "globalprotect"]
    score = calculate_keyword_match(answer, keywords)
    assert score == 0.0


def test_keyword_match_empty():
    """Test keyword match with no expected keywords."""
    answer = "Any answer"
    keywords = []
    score = calculate_keyword_match(answer, keywords)
    assert score == 1.0


def test_time_relevance_valid():
    """Test time relevance when docs are within date range."""
    sources = [
        {"valid_from": "2024-01-01", "valid_to": "2024-12-31"},
        {"valid_from": "2024-06-01", "valid_to": "2024-12-31"},
    ]
    score = check_time_relevance(sources, "2024-06-15")
    assert score == 1.0


def test_time_relevance_mixed():
    """Test time relevance with mix of valid and invalid docs."""
    sources = [
        {"valid_from": "2024-01-01", "valid_to": "2024-12-31"},
        {"valid_from": "2022-01-01", "valid_to": "2022-12-31"},
    ]
    score = check_time_relevance(sources, "2024-06-15")
    assert score == 0.5


def test_time_relevance_none_valid():
    """Test time relevance when no docs are in date range."""
    sources = [
        {"valid_from": "2022-01-01", "valid_to": "2022-12-31"},
    ]
    score = check_time_relevance(sources, "2024-06-15")
    assert score == 0.0


def test_source_relevance_found():
    """Test source relevance when expected source is found."""
    sources = [
        {"source": "vpn_policy_2024.pdf"},
        {"source": "leave_policy.pdf"},
    ]
    assert check_source_relevance(sources, "vpn_policy") == True


def test_source_relevance_not_found():
    """Test source relevance when expected source is not found."""
    sources = [
        {"source": "leave_policy.pdf"},
    ]
    assert check_source_relevance(sources, "vpn_policy") == False


def test_source_relevance_none_expected():
    """Test source relevance when no specific source expected."""
    sources = [{"source": "any.pdf"}]
    assert check_source_relevance(sources, None) == True