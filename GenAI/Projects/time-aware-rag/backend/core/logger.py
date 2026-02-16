"""
Structured Logging System for Time-Aware RAG
Replaces all print() statements with proper logging.
Logs to both terminal and file with timestamps and levels.
"""
import logging
import sys
from pathlib import Path
from datetime import datetime

def setup_logger(name: str = "rag", log_to_file: bool = True) -> logging.Logger:
    """
    Create a structured logger.
    
    Args:
        name: Logger name
        log_to_file: Whether to also save logs to a file
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Avoid adding handlers multiple times
    if logger.handlers:
        return logger
    
    logger.setLevel(logging.DEBUG)
    
    # Log format with timestamp, level, and message
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    # Handler 1: Print to terminal (INFO and above)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Handler 2: Save to file (DEBUG and above — captures everything)
    if log_to_file:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        log_filename = f"rag_{datetime.now().strftime('%Y-%m-%d')}.log"
        file_handler = logging.FileHandler(log_dir / log_filename)
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger


def get_logger(module_name: str = "rag") -> logging.Logger:
    """
    Get a logger for a specific module.
    
    Usage in any file:
        from core.logger import get_logger
        logger = get_logger(__name__)
        
        logger.info("Document added successfully")
        logger.error(f"Failed to connect: {e}")
        logger.warning("Cache miss")
        logger.debug("Processing query embedding")
    """
    return setup_logger(module_name)