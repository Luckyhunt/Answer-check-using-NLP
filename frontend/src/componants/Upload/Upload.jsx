import { useNavigate } from "react-router"
import { useState } from "react"

import useFileContext from "../../StateManager/FileContext"
import Dropbox from "./Dropbox"
import UploadedFiles from "./UploadedFiles"

import "./Upload.css"
import useTextExtractionContext from "../../StateManager/TextExtraction"

const Upload = () => {

    const navigation = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false)

    const { fileData } = useFileContext()
    const { setModelText, setStudentText } = useTextExtractionContext()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!fileData.modelFile || !fileData.studentFile) {
            alert("Please upload both model and student files")
            return
        }

        setIsProcessing(true)

        try {
            const formData1 = new FormData()
            const formData2 = new FormData()

            formData1.append("file", fileData.modelFile)
            formData2.append("file", fileData.studentFile)

            const sendModelFile = await fetch("http://127.0.0.1:8000/extractFileText", {
                method: 'POST',
                body: formData1
            })

            if (!sendModelFile.ok) {
                throw new Error('Failed to process model file')
            }

            const modelResult = await sendModelFile.json()
            const modelText = modelResult.extracted_text || ""
            setModelText(modelText)

            // Check if model text extraction had issues
            if (modelText.includes("Error") || modelText.includes("failed") || modelText.includes("OCR processing failed")) {
                console.warn("⚠️ Model file processing may have issues:", modelText)
                if (modelText.includes("Poppler")) {
                    alert("⚠️ Note: PDF processing is limited. Some advanced PDF features may not be available. The basic text extraction will still work.")
                }
            }

            const sendStudentFiles = await fetch("http://127.0.0.1:8000/extractFileText", {
                method: "POST",
                body: formData2
            })

            if (!sendStudentFiles.ok) {
                throw new Error('Failed to process student file')
            }

            const studentResult = await sendStudentFiles.json()
            const studentText = studentResult.extracted_text || ""
            setStudentText(studentText)

            // Check if student text extraction had issues
            if (studentText.includes("Error") || studentText.includes("failed") || studentText.includes("OCR processing failed")) {
                console.warn("⚠️ Student file processing may have issues:", studentText)
                if (studentText.includes("Poppler")) {
                    alert("⚠️ Note: PDF processing is limited. Some advanced PDF features may not be available. The basic text extraction will still work.")
                }
            }

            // Mark that we have processed data
            localStorage.setItem('hasProcessedData', 'true')

            navigation("/summary")
        }

        catch (err) {
            console.error("Upload error:", err)
            alert("Error processing files. Please try again.")
        }

        finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="Upload" id="Upload">
            <h2 className="Upload__title">Upload your answer sheets</h2>
            <div className="Upload__container">
                <Dropbox type="model" />
                <Dropbox type="student" />
            </div>

            <UploadedFiles />

            <div className="Upload__btn">
                <button
                    onClick={handleSubmit}
                    className="link__btn"
                    disabled={!fileData.modelFile || !fileData.studentFile || isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <span className="loading-spinner">⏳</span>
                            Extracting Text... Please Wait
                        </>
                    ) : (
                        "Process & Review Extracted Text"
                    )}
                </button>
            </div>
        </div>
    )
}

export default Upload
