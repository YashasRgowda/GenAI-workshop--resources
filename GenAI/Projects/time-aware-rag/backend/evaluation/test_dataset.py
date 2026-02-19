"""
Test Dataset for RAG Evaluation
Contains test questions with expected answers and relevant document info.
"""

# Each test case has:
# - query: the question to ask
# - query_date: the date context
# - expected_keywords: words that SHOULD appear in a good answer
# - expected_source: the document source that should be retrieved
# - description: what this test case checks

TEST_CASES = [
    {
        "query": "What is the VPN policy?",
        "query_date": "2024-06-15",
        "expected_keywords": ["vpn", "remote", "globalprotect", "multi-factor"],
        "expected_source": "vpn_policy",
        "description": "Basic retrieval - should find VPN policy document"
    },
    {
        "query": "What are the password requirements?",
        "query_date": "2024-06-15",
        "expected_keywords": ["password", "12 characters", "uppercase", "special"],
        "expected_source": "password_policy",
        "description": "Basic retrieval - should find password policy"
    },
    {
        "query": "What is the leave policy?",
        "query_date": "2024-06-15",
        "expected_keywords": ["leave", "days", "paid"],
        "expected_source": "leave_policy",
        "description": "Basic retrieval - should find leave policy"
    },
    {
        "query": "What is the VPN policy?",
        "query_date": "2020-01-01",
        "expected_keywords": [],
        "expected_source": None,
        "description": "Time filtering - 2020 query should NOT find 2024 VPN policy"
    },
    {
        "query": "What is the work from home policy?",
        "query_date": "2024-06-15",
        "expected_keywords": ["remote", "vpn"],
        "expected_source": "vpn_policy",
        "description": "Semantic search - different wording, should still find VPN policy"
    },
]

# Documents to seed the system with before evaluation
SEED_DOCUMENTS = [
    {
        "content": "All employees must use the company VPN when working remotely. "
                   "The approved VPN client is GlobalProtect. Employees must connect "
                   "to the VPN before accessing any internal resources. Multi-factor "
                   "authentication is required for all VPN connections. Split tunneling "
                   "is not permitted.",
        "valid_from": "2024-01-01",
        "valid_to": "2024-12-31",
        "source": "vpn_policy_2024.pdf"
    },
    {
        "content": "The company password policy requires all employees to use "
                   "passwords with minimum 12 characters, including uppercase, "
                   "lowercase, numbers, and special characters. Passwords must "
                   "be changed every 90 days. Two-factor authentication is mandatory "
                   "for all systems.",
        "valid_from": "2024-01-01",
        "valid_to": "2024-12-31",
        "source": "password_policy_2024.pdf"
    },
    {
        "content": "Employees are entitled to 25 days of paid leave per year. "
                   "Leave must be approved by the direct manager at least 5 days "
                   "in advance. Unused leave can be carried forward up to 10 days "
                   "to the next year. Sick leave requires a medical certificate "
                   "for absences longer than 2 consecutive days.",
        "valid_from": "2024-01-01",
        "valid_to": "2024-12-31",
        "source": "leave_policy_2024.pdf"
    },
    {
        "content": "The old VPN policy required employees to use Cisco AnyConnect "
                   "for remote access. Two-factor authentication was optional. "
                   "VPN was only required for accessing sensitive systems.",
        "valid_from": "2022-01-01",
        "valid_to": "2022-12-31",
        "source": "vpn_policy_2022.pdf"
    },
]