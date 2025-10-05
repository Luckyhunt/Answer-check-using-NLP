import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sentence_transformers import SentenceTransformer, util
from textblob import TextBlob
import re
from text_preprocessing import clean_extracted_text  # <-- NEW IMPORT


# The following statements are need to be ran only once
# nltk.download("punkt_tab") # This might not be needed, commenting out for safety
# nltk.download("punkt")
# nltk.download("stopwords")
# nltk.download("wordnet")

# Note: spacy is imported but not used in the functions you provided.

def preprocess_text(text: str):
    # 1. Clean the input text first using the shared function
    cleaned_text = clean_extracted_text(text)

    lemmatizer = WordNetLemmatizer()
    tokens = word_tokenize(cleaned_text.lower())
    stop_words = set(stopwords.words("english"))
    cleaned_tokens = [
        lemmatizer.lemmatize(token)
        for token in tokens
        if token.isalpha() and token not in stop_words
    ]

    return cleaned_tokens


def keyword_matching(model_answer, student_answer):
    matched_keywords = set()
    processed_model = preprocess_text(model_answer)
    processed_student = preprocess_text(student_answer)

    # returns matched_keywords and keyword overlap
    return matched_keywords, len(matched_keywords) / len(processed_model) if len(processed_model) > 0 else 0


def semantic_similarity(model_answer, student_answer):
    # Clean the input text before generating embeddings
    cleaned_model = clean_extracted_text(model_answer)
    cleaned_student = clean_extracted_text(student_answer)

    model = SentenceTransformer("all-MiniLM-L6-v2")

    embedding_1 = model.encode(cleaned_model, convert_to_tensor=True)
    embedding_2 = model.encode(cleaned_student, convert_to_tensor=True)

    cosine_score = util.cos_sim(embedding_1, embedding_2)

    return cosine_score.item()


def _get_tone_score(text: str) -> dict:
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity

    return {
        "polarity": polarity,
        "subjectivity": subjectivity,
        "avg_score": (polarity + subjectivity) / 2
    }


def get_tone(text: str):
    # Clean the input text before running sentiment analysis
    cleaned_text = clean_extracted_text(text)

    tone_score = _get_tone_score(cleaned_text)
    pol = tone_score["polarity"]
    sub = tone_score["subjectivity"]
    avg = tone_score["avg_score"]

    if pol > 0.6:
        if sub > 0.6:
            return "Enthusiastic & Personal", avg
        else:
            return "Positive & Factual", avg
    elif pol < 0.3:
        if sub > 0.6:
            return "Personal & Critical", avg
        else:
            return "Neutral & Factual", avg
    else:
        if sub > 0.6:
            return "Expressive & Emotional", avg
        else:
            return "Factual & Objective", avg


if __name__ == "__main__":
    text_happy = "I am so excited and overjoyed to finally start my new project!"
    text_anger = "I am furious with the customer service; it was absolutely terrible."
    text_sadness = "I feel so lonely and disappointed after the result."

    print(get_tone(text_happy))