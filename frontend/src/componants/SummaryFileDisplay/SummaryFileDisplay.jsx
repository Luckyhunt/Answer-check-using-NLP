import { useState, useEffect } from "react"
import useFileContext from "../../StateManager/FileContext"

import "./SummaryFileDisplay.css"
import useTextExtractionContext from "../../StateManager/TextExtraction"

import DOMPurify from "dompurify"

const SummaryFileDisplay = ({ type, pdfFile }) => {

    const { extractedText } = useTextExtractionContext()

    const text = type === "Model" ? extractedText.model : extractedText.student

    return (
        <div className="SummaryFileDisplay">
            <h4 className="SummaryFileDisplay__title">{type} Answer Sheet </h4>

            {pdfFile && (
                <div className="SummaryFileDisplay__img--container">
                    <object
                        className="SummaryFileDisplay__pdfFile"
                        data={URL.createObjectURL(pdfFile)}
                        type="application/pdf"
                        width="100%"
                        height="400"
                    ></object>
                </div>
            )}

            {!pdfFile && (
                <div className="SummaryFileDisplay__no-file">
                    <p>PDF file not available (cannot display after page reload)</p>
                </div>
            )}

            <span className="SummaryFileDisplay__extracted--text--title">Extracted Text:</span>
            <div className="SummaryFileDisplay__text-container">
                {text.includes("OCR processing failed") || text.includes("Error") || text.includes("Poppler") ? (
                    <div className="SummaryFileDisplay__warning">
                        <p>⚠️ <strong>Processing Note:</strong> {text.includes("Poppler") ?
                            "PDF processed successfully! Some advanced features may be limited, but the basic text extraction worked." :
                            text}
                        </p>
                        {text.includes("Poppler") && (
                            <p><em>Note: This PDF was processed using basic text extraction. For scanned PDFs, consider installing Poppler for full OCR support.</em></p>
                        )}
                        {!text.includes("Poppler") && (
                            <p><em>Suggestion: Try uploading a clearer image or a PDF/DOCX file for better results.</em></p>
                        )}
                    </div>
                ) : (
                    <p
                        className="SummaryFileDisplay__extracted--text"
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                                text ? text.replace(/\n/g, "<br>") : "No text extracted from the file."
                            )
                        }}
                    ></p>
                )}
            </div>
        </div>
    )
}

export default SummaryFileDisplay
