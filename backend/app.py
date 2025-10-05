from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Any
from PIL import Image
from io import BytesIO
from PyPDF2 import PdfReader
from pydantic import BaseModel
import docx
import traceback
import os
import io

# --- HYBRID OCR / API IMPORTS ---
import requests
import base64
from pdf2image import convert_from_bytes  # Requires external Poppler utility
# --------------------------------

# --- LOCAL IMPORTS ---
from evaluation import keyword_matching, semantic_similarity, get_tone
from text_preprocessing import clean_extracted_text, get_text_quality_score, get_improvement_suggestions

# ---------------------

# --- GEMINI API CONFIGURATION (FOR HIGH-ACCURACY HANDWRITING) ---
GEMINI_API_KEY = ""  # *** PASTE YOUR GEMINI API KEY HERE ***
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent"

SYSTEM_INSTRUCTION_OCR = (
    "You are an expert OCR system. Transcribe all text, preserving original "
    "line breaks and structural formatting exactly. DO NOT add any commentary or notes."
)
# --------------------------------

app = FastAPI()


# --- PYDANTIC MODELS (MUST BE DEFINED EARLY) ---
class Answers(BaseModel):
    model: str
    student: str


# ------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# --- GEMINI OCR HELPER FUNCTIONS ---

def image_to_base64(image: Image.Image) -> str:
    """Converts a PIL Image object to a robust Base64 encoded string (JPEG format)."""
    image = image.convert("RGB")
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')


def ocr_image_gemini(image: Image.Image) -> str:
    """Sends a single image to the Gemini API for transcription."""

    base64_image = image_to_base64(image)
    key_param = f"?key={GEMINI_API_KEY}" if GEMINI_API_KEY else ""

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": "Transcribe the document text exactly as formatted."}]},
            {"inlineData": {"mimeType": "image/jpeg", "data": base64_image}}
        ],
        "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION_OCR}]},
        "generationConfig": {"maxOutputTokens": 4096}
    }

    response = requests.post(f"{GEMINI_API_URL}{key_param}", json=payload)
    response.raise_for_status()

    result = response.json()
    extracted_text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')

    return extracted_text


def extract_text_from_image_bytes(image_bytes):
    """Handles single image file bytes using Gemini OCR."""
    try:
        image = Image.open(BytesIO(image_bytes))
        raw_text = ocr_image_gemini(image)

        cleaned_text = clean_extracted_text(raw_text)
        print(f"📊 Image OCR (Gemini): Raw={len(raw_text)} chars, Cleaned={len(cleaned_text)} chars")
        return cleaned_text
    except Exception as e:
        print(f"❌ Gemini Image OCR Error: {str(e)}")
        return f"Image OCR Error: {str(e)}"


def extract_text_from_pdf_bytes(pdf_bytes):
    """Hybrid: Extracts text from PDF, falling back to Gemini OCR for scanned pages."""
    full_text = []

    try:
        reader = PdfReader(BytesIO(pdf_bytes))

        # Use pdf2image to convert all pages to images (required for scanned OCR)
        images = convert_from_bytes(pdf_bytes)

        for i, page in enumerate(reader.pages):
            # a) Try PyPDF2 for selectable text (digital text)
            text = page.extract_text() or ""

            if text.strip():
                full_text.append(f"\n\n--- Page {i + 1} (Text Layer) ---\n{text}")
            else:
                # b) Fallback to Gemini OCR for scanned pages
                print(f"⚠️ Page {i + 1} appears scanned or empty. Starting Gemini OCR...")

                if i < len(images):
                    ocr_result = ocr_image_gemini(images[i])
                    full_text.append(f"\n\n--- Page {i + 1} (Image OCR) ---\n{clean_extracted_text(ocr_result)}")
                else:
                    full_text.append(f"\n\n--- Page {i + 1} failed image conversion ---")

    except Exception as e:
        if "pdfinfo" in str(e) or "Poppler" in str(e):
            return f"PDF Error: Poppler utility is missing. Please install Poppler for your OS to enable scanned PDF OCR. Details: {e}"
        print(f"❌ PDF processing error: {e}")
        return f"PDF Processing Error: {e}"

    final_text = "\n".join(full_text)
    print(f"PDF extraction total: {len(final_text)} characters")
    return final_text


def extract_text_from_docx_bytes(docx_bytes):
    """Extract text from DOCX file bytes."""
    doc = docx.Document(io.BytesIO(docx_bytes))
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    text = '\n'.join(full_text)

    cleaned_text = clean_extracted_text(text)
    print(f"DOCX extraction: Raw={len(text)} chars, Cleaned={len(cleaned_text)} chars")
    return cleaned_text


@app.post("/extractFileText/")
async def extractFileText(file: UploadFile = File(...)):
    try:
        file_content = await file.read()
        extracted_text = ""
        is_ocr = False

        file_extension = file.filename.split('.')[-1].lower()

        if file_extension in ('png', 'jpeg', 'jpg'):
            extracted_text = extract_text_from_image_bytes(file_content)
            is_ocr = True
        elif file_extension == 'pdf':
            extracted_text = extract_text_from_pdf_bytes(file_content)
            is_ocr = True
        elif file_extension == 'docx':
            extracted_text = extract_text_from_docx_bytes(file_content)
            is_ocr = False
        else:
            return {"message": "Unsupported file type"}

        if "Error" in extracted_text or "Error" in extracted_text:
            raise HTTPException(status_code=500, detail=extracted_text)

        final_text = clean_extracted_text(extracted_text)

        return {
            "message": "File processed successfully",
            "filename": file.filename,
            "size": file.size,
            "size_units": "bytes",
            "type": file.content_type,
            "extracted_text": final_text
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in file processing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error occurred during file processing: {str(e)}"
        )


@app.post("/evaluation/")
async def evaluation(answers: Answers):
    try:
        model_answer = answers.model
        student_answer = answers.student

        (_, percent) = keyword_matching(model_answer, student_answer)
        semantics = semantic_similarity(model_answer, student_answer)
        tone, score = get_tone(student_answer)

        return {
            "message": "200 OK",
            "keyword": percent,
            "semantics": semantics,
            "tone": tone,
            "toneScore": score
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Evaluation failed.")


@app.get("/")
async def root():
    return {
        "message": "Answer Sheet Checker using NLP API",
        "endpoints": {
            "extract_text": "/extractFileText/",
            "compare_answers": "/evaluation/",
            "docs": "/docs"
        },
        "supported_file_types": ["PDF (Hybrid Scanned & Digital)", "PNG", "JPG", "JPEG", "DOCX"],
        "ocr_source": "Gemini Vision API (Hybrid)"
    }
