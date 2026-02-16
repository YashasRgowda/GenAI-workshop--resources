"""
Test Configuration & Fixtures
Sets up test client, test database session, and shared utilities.
All test files automatically use these fixtures.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from core.cache import get_cache_manager


@pytest.fixture(scope="module")
def client():
    """
    Create a test client for the FastAPI app.
    This lets us make API calls without starting the server.
    """
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def sample_document():
    """Sample document data for testing."""
    return {
        "content": "All employees must use the company VPN when working remotely. "
                   "The approved VPN client is GlobalProtect. Employees must connect "
                   "to the VPN before accessing any internal resources. Multi-factor "
                   "authentication is required for all VPN connections.",
        "valid_from": "2024-01-01",
        "valid_to": "2024-12-31",
        "source": "test_vpn_policy_2024.pdf"
    }


@pytest.fixture(scope="module")
def sample_document_v2():
    """Updated version of sample document for versioning tests."""
    return {
        "content": "All employees must use the company VPN when working remotely. "
                   "The approved VPN client has been upgraded to GlobalProtect v6. "
                   "Employees must connect to the VPN before accessing any internal "
                   "resources. Multi-factor authentication using hardware tokens is "
                   "now mandatory for all VPN connections. Split tunneling is disabled.",
        "valid_from": "2025-01-01",
        "valid_to": "2025-12-31",
        "source": "test_vpn_policy_2024.pdf"
    }


@pytest.fixture
def clear_cache():
    """Clear Redis cache before a test."""
    cache = get_cache_manager()
    if cache.enabled:
        cache.clear_all()
    yield
    # Clean up after test too
    if cache.enabled:
        cache.clear_all()