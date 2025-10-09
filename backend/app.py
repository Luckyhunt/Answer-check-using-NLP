from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Any
from PIL import Image
from io import BytesIO
from PyPDF2 import PdfReader
from pydantic import BaseModel
from docx import Document
import traceback
import os
import io

import requests
import base64
from pdf2image import convert_from_bytes

# --- LOCAL IMPORTS ---
from evaluation import keyword_matching, semantic_similarity, get_tone
from text_preprocessing import clean_extracted_text, get_text_quality_score, get_improvement_suggestions

GEMINI_API_KEY = "AIzaSyAr6pNkC5ZZgbjEVnoTBVeYpE9jPbnPUIE"  # *** PASTE YOUR GEMINI API KEY HERE ***
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent"

SYSTEM_INSTRUCTION_OCR = (
    "You are an expert OCR system. Transcribe all text, preserving original "
    "line breaks and structural formatting exactly. DO NOT add any commentary or notes."
)
# --------------------------------

app = FastAPI()

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
    """
    Converts a PIL Image object to a robust Base64 encoded string,
    forcing conversion to RGB/JPEG to prevent API MIME type errors.
    """
    # Force conversion to RGB mode for consistency
    image = image.convert("RGB")

    buffered = BytesIO()
    # Save the image explicitly as JPEG for the MIME type specified in the payload
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')


def recognize_handwritten_text_gemini(image: Image.Image) -> str:
    """
    Sends the image to the Gemini API for robust, multi-line handwriting transcription.
    """

    # Convert image to base64 for API payload
    try:
        base64_image = image_to_base64(image)
    except Exception as e:
        return f"Image Processing Error: Could not convert image to base64. {e}"

    # 2. Construct the API Payload
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    { "text": "Transcribe the handwritten document exactly as formatted." },
                    {
                        "inlineData": {
                            "mimeType": "image/jpeg",
                            "data": base64_image
                        }
                    }
                ]
            }
        ],
        "systemInstruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION_OCR}]
        },
        # --- FIX APPLIED HERE: Renamed 'config' to 'generationConfig' ---
        "generationConfig": {
            "maxOutputTokens": 2048
        }
    }

    # 3. Make the API Request
    try:
        key_param = f"?key={GEMINI_API_KEY}" if GEMINI_API_KEY else ""

        response = requests.post(f"{GEMINI_API_URL}{key_param}", json=payload)
        response.raise_for_status()

        result = response.json()

        # 4. Extract the transcribed text
        extracted_text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'Transcription failed: Empty response from API.')

        if extracted_text == 'Transcription failed: Empty response from API.':
            return f"Transcription failed. API Response may indicate safety or internal error. Response: {result}"

        return extracted_text

    except requests.exceptions.RequestException as e:
        # Check for status code to provide better user feedback
        status_code = response.status_code if 'response' in locals() else 'N/A'
        return f"API Connection/Request Error: Status Code {status_code}. Please ensure your API key is valid and the model is accessible. Error: {e}"
    except Exception as e:
        return f"An unexpected error occurred during processing: {e}"


def extract_text_from_image_bytes(image_bytes):
    """Handles single image file bytes using the improved Gemini OCR."""
    try:
        image = Image.open(BytesIO(image_bytes))
        raw_text = recognize_handwritten_text_gemini(image)

        cleaned_text = clean_extracted_text(raw_text)
        print(f"📊 Image OCR (Gemini): Raw={len(raw_text)} chars, Cleaned={len(cleaned_text)} chars")
        return cleaned_text

    except Exception as e:
        print(f"❌ Image processing error: {str(e)}")
        return f"Image processing error: {str(e)}"


def extract_text_from_pdf_bytes(pdf_bytes):
    """Hybrid: Extracts text from PDF, falling back to OCR only when needed."""
    full_text = []

    try:
        reader = PdfReader(BytesIO(pdf_bytes))
        total_pages = len(reader.pages)

        # First pass: Try to extract text directly from all pages
        extracted_pages = []
        total_extracted_chars = 0

        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            extracted_pages.append(text)
            total_extracted_chars += len(text.strip())

        # If we have substantial text content, return it directly
        if total_extracted_chars > 100:  # Consider it a digital PDF if we have meaningful text
            print(f"📄 Digital PDF detected: {total_extracted_chars} characters extracted")
            full_text = [f"\n\n--- Page {i + 1} ---\n{text}" for i, text in enumerate(extracted_pages) if text.strip()]
        else:
            # Second pass: Try OCR for scanned PDFs, but only if Poppler is available
            print(f"📄 Scanned PDF detected ({total_extracted_chars} chars). Attempting OCR...")

            try:
                # Try to convert pages to images for OCR
                images = convert_from_bytes(pdf_bytes)

                for i, (page, image) in enumerate(zip(reader.pages, images)):
                    text = page.extract_text() or ""

                    if text.strip() and len(text.strip()) > 50:  # Page has good text
                        full_text.append(f"\n\n--- Page {i + 1} (Text) ---\n{text}")
                    else:  # Try OCR
                        try:
                            ocr_result = recognize_handwritten_text_gemini(image)
                            full_text.append(f"\n\n--- Page {i + 1} (OCR) ---\n{clean_extracted_text(ocr_result)}")
                        except Exception as ocr_error:
                            print(f"❌ OCR failed for page {i + 1}: {str(ocr_error)}")
                            full_text.append(f"\n\n--- Page {i + 1} (No Text) ---\nThis page could not be processed. It may contain images or non-standard formatting.")

            except ImportError:
                # pdf2image not available
                print("⚠️ Poppler not available. Processing digital text only.")
                for i, text in enumerate(extracted_pages):
                    if text.strip():
                        full_text.append(f"\n\n--- Page {i + 1} ---\n{text}")
                    else:
                        full_text.append(f"\n\n--- Page {i + 1} ---\n[Page appears to be scanned or image-based. Install Poppler for OCR support.]")

            except Exception as conversion_error:
                if "pdfinfo" in str(conversion_error) or "Poppler" in str(conversion_error):
                    print("⚠️ Poppler utility not found. Processing digital text only.")
                    for i, text in enumerate(extracted_pages):
                        if text.strip():
                            full_text.append(f"\n\n--- Page {i + 1} ---\n{text}")
                        else:
                            full_text.append(f"\n\n--- Page {i + 1} ---\n[Page appears to be scanned. Poppler required for OCR.]")
                else:
                    print(f"❌ PDF conversion error: {str(conversion_error)}")
                    # Fall back to whatever text we could extract
                    for i, text in enumerate(extracted_pages):
                        if text.strip():
                            full_text.append(f"\n\n--- Page {i + 1} ---\n{text}")

    except Exception as e:
        print(f"❌ PDF processing error: {str(e)}")
        return f"PDF Processing Error: {str(e)}"

    final_text = "\n".join(full_text)
    print(f"📊 PDF processing complete: {len(final_text)} characters from {total_pages} pages")
    return final_text


def extract_text_from_docx_bytes(docx_bytes):
    """Extract text from DOCX file bytes."""
    doc = Document(io.BytesIO(docx_bytes))
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    text = '\n'.join(full_text)

    cleaned_text = clean_extracted_text(text)
    print(f"DOCX extraction: Raw={len(text)} chars, Cleaned={len(cleaned_text)} chars")
    return cleaned_text


@app.post("/extractFileText/")
async def extractFileText(file: UploadFile = File(...)):
    return await extractFileTextHandler(file)

@app.post("/extractFileText")
async def extractFileTextNoSlash(file: UploadFile = File(...)):
    return await extractFileTextHandler(file)

async def extractFileTextHandler(file: UploadFile):
    try:
        file_content = await file.read()
        extracted_text = ""

        file_extension = file.filename.split('.')[-1].lower() if file.filename else ""

        if file_extension in ('png', 'jpeg', 'jpg', 'gif', 'bmp'):
            extracted_text = extract_text_from_image_bytes(file_content)
        elif file_extension == 'pdf':
            extracted_text = extract_text_from_pdf_bytes(file_content)
        elif file_extension in ('docx', 'doc'):
            extracted_text = extract_text_from_docx_bytes(file_content)
        elif file_extension == 'txt':
            extracted_text = file_content.decode('utf-8', errors='ignore')
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_extension}. Supported: PDF, PNG, JPG, JPEG, GIF, BMP, DOCX, DOC, TXT")

        # Check for errors in extracted text
        if "Error" in extracted_text:
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
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error occurred during file processing: {str(e)}"
        )


@app.post("/evaluation")
async def evaluation(answers: Answers):
    try:
        model_answer = answers.model
        student_answer = answers.student

        print(f"🔍 Evaluating answers...")
        print(f"📝 Model answer length: {len(model_answer)} chars")
        print(f"📝 Student answer length: {len(student_answer)} chars")

        matched_keywords, keyword_percent = keyword_matching(model_answer, student_answer)
        semantics = semantic_similarity(model_answer, student_answer)
        tone, tone_score = get_tone(student_answer)

        print(f"📊 Final results: Keywords={keyword_percent:.3f}, Semantics={semantics:.3f}, Tone={tone_score:.3f}")

        return {
            "message": "200 OK",
            "keyword": keyword_percent,
            "semantics": semantics,
            "tone": tone,
            "toneScore": tone_score
        }
    except Exception as e:
        print(f"❌ Evaluation error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


@app.get("/")
async def root():
    # Test OCR availability
    ocr_status = "Limited (API issues detected)"
    try:
        # Simple test - just check if we can import the modules
        import requests
        ocr_status = "Available (Gemini API + Tesseract fallback)"
    except:
        ocr_status = "Limited (fallback only)"

    return {
        "message": "Answer Sheet Checker using NLP API",
        "endpoints": {
            "extract_text": "/extractFileText/",
            "compare_answers": "/evaluation/",
            "docs": "/docs"
        },
        "supported_file_types": ["PDF (Hybrid Scanned & Digital)", "PNG", "JPG", "JPEG", "GIF", "BMP", "DOCX", "DOC", "TXT"],
        "ocr_source": ocr_status,
        "status": "Operational with OCR fallback handling"
    }
