import { useState, useEffect } from "react"
import useFileContext from "../../StateManager/FileContext"

import "./SummaryFileDisplay.css"
import useTextExtractionContext from "../../StateManager/TextExtraction"

import DOMPurify from "dompurify"

const SummaryFileDisplay = ({ type, pdfFile }) => {

    const { extractedText } = useTextExtractionContext()

    const pdfFileUrl = URL.createObjectURL(pdfFile)

    const htmlModelText = extractedText.model.replace(/\n/, "<br>")
    const htmlStudentText = extractedText.student.replace(/\n/, "<br>")

    return (
        <div className="SummaryFileDisplay">
            <h4 className="SummaryFileDisplay__title">{type} Answer Sheet </h4>
            <div className="SummaryFileDisplay__img--container">
                {/* Replace the below comment with pdf display */}
                <object
                    className="SummaryFileDisplay__pdfFile"
                    data={pdfFileUrl}
                    type="application/pdf"
                    width="100%"
                    height="400"
                ></object>
            </div>
            <span className="SummaryFileDisplay__extracted--text--title">Extracted Text:</span>
            <p
            className="SummaryFileDisplay__extracted--text"
            dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                    type === "Model" ?
                    htmlModelText :
                    htmlStudentText
                )
            }}
            >
            </p>        
        </div>
    )
}

export default SummaryFileDisplay
