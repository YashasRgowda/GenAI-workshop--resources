import PyPDF2
import io
import re
from datetime import datetime, date
from typing import Optional, Tuple, Dict
import dateparser

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file bytes."""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text_content = []
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            if text.strip():
                text_content.append(text)
        
        full_text = "\n\n".join(text_content)
        
        print(f"✅ Extracted {len(full_text)} characters from {len(pdf_reader.pages)} pages")
        return full_text.strip()
    
    except Exception as e:
        print(f"❌ Error extracting PDF: {e}")
        raise Exception(f"Failed to process PDF: {str(e)}")


def extract_dates_from_text(text: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Extract effective date and expiry date from document text using AI patterns.
    
    Returns:
        Tuple of (valid_from, valid_to) in YYYY-MM-DD format
    """
    
    # Common date patterns in policy documents
    patterns = {
        'effective_date': [
            r'Effective Date:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
            r'Effective:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
            r'Effect(?:ive)? from:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
            r'Valid from:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
            r'Starting:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
            r'Effective Date:\s*(\d{4}-\d{2}-\d{2})',
        ],
        'expiry_date': [
            r'Valid Through:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
            r'Valid Until:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
            r'Expires?:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
            r'Valid to:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
            r'Valid Through:\s*(\d{4}-\d{2}-\d{2})',
            r'Through:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
        ]
    }
    
    valid_from = None
    valid_to = None
    
    # Try to find effective date
    for pattern in patterns['effective_date']:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            parsed_date = dateparser.parse(date_str)
            if parsed_date:
                valid_from = parsed_date.strftime("%Y-%m-%d")
                print(f"✅ Found effective date: {valid_from}")
                break
    
    # Try to find expiry date
    for pattern in patterns['expiry_date']:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            parsed_date = dateparser.parse(date_str)
            if parsed_date:
                valid_to = parsed_date.strftime("%Y-%m-%d")
                print(f"✅ Found expiry date: {valid_to}")
                break
    
    # If we found start but not end, assume 1 year validity
    if valid_from and not valid_to:
        start = datetime.strptime(valid_from, "%Y-%m-%d")
        # Find year in text
        year_match = re.search(r'\b(20\d{2})\b', text)
        if year_match:
            year = int(year_match.group(1))
            valid_to = f"{year}-12-31"
            print(f"⚠️ No expiry found, assuming end of year: {valid_to}")
    
    # If still no dates, try to find any year and assume Jan 1 - Dec 31
    if not valid_from or not valid_to:
        year_matches = re.findall(r'\b(20\d{2})\b', text[:500])  # Check first 500 chars
        if year_matches:
            year = year_matches[0]
            if not valid_from:
                valid_from = f"{year}-01-01"
            if not valid_to:
                valid_to = f"{year}-12-31"
            print(f"⚠️ Using detected year: {year}")
    
    return valid_from, valid_to


def extract_metadata_from_pdf(file_content: bytes) -> Dict:
    """
    Extract all metadata from PDF including text, dates, and document info.
    
    Returns:
        Dictionary with:
        - content: Extracted text
        - valid_from: Start date (YYYY-MM-DD)
        - valid_to: End date (YYYY-MM-DD)
        - metadata: Additional info
    """
    # Extract text
    text = extract_text_from_pdf(file_content)
    
    # Extract dates
    valid_from, valid_to = extract_dates_from_text(text)
    
    # Extract policy version if present
    version_match = re.search(r'(?:Policy )?Version:\s*([\d.]+)', text, re.IGNORECASE)
    policy_version = version_match.group(1) if version_match else None
    
    # Extract department if present
    dept_match = re.search(r'Department:\s*([A-Za-z\s]+)', text, re.IGNORECASE)
    department = dept_match.group(1).strip() if dept_match else None
    
    return {
        "content": text,
        "valid_from": valid_from,
        "valid_to": valid_to,
        "metadata": {
            "policy_version": policy_version,
            "department": department,
            "extraction_method": "AI-automated"
        }
    }


def validate_pdf(file_content: bytes) -> bool:
    """Check if file is a valid PDF."""
    try:
        if file_content[:4] != b'%PDF':
            return False
        pdf_file = io.BytesIO(file_content)
        PyPDF2.PdfReader(pdf_file)
        return True
    except:
        return False