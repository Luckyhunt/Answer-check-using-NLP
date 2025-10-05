import re
from typing import List


# --- Text Preprocessing Functions ---

def clean_extracted_text(text: str) -> str:
    """
    Cleans raw OCR or extracted text by removing common formatting and collapsing spaces.
    This step is crucial for preparing text for NLP analysis.
    """
    if not text:
        return ""

    # 1. Normalize whitespace: replace newlines/tabs with spaces and collapse multiple spaces
    text = re.sub(r'[\n\r\t]+', ' ', text)
    text = re.sub(r' {2,}', ' ', text)

    # 2. Remove non-essential symbols often misread by traditional OCR
    # Keeping only letters, numbers, standard punctuation, and symbols.
    text = re.sub(r'[^a-zA-Z0-9\s\.\,\!\?\;\:\(\)\[\]\{\}\-\"\']', ' ', text)

    return text.strip()


def get_text_quality_score(text: str) -> float:
    """
    Placeholder function for calculating a quality score.
    """
    if not text:
        return 0.0

    alpha_numeric_count = len(re.sub(r'[^a-zA-Z0-9]', '', text))
    total_length = len(text)

    if total_length == 0:
        return 0.0

    return min(100.0, (alpha_numeric_count / total_length) * 100)


def get_improvement_suggestions(text: str) -> str:
    """
    Placeholder function for providing text clarity suggestions.
    """
    if len(text.split()) < 5:
        return "Extracted text is very short; check if the entire document was processed."

    return "The text appears clean and well-structured, ready for NLP analysis."