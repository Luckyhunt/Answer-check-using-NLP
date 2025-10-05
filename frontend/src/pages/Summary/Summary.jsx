import React, { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router"
import SummaryFileDisplay from "../../componants/SummaryFileDisplay/SummaryFileDisplay"
import Evaluation from "../../componants/Evaluation/Evaluation"

import useFileContext from "../../StateManager/FileContext"
import useTextExtractionContext from "../../StateManager/TextExtraction"

import "./Summary.css"

const Summary = () => {
    const navigate = useNavigate()
    const { fileData, clearProcessedData } = useFileContext()
    const { extractedText } = useTextExtractionContext()
    const [showEvaluation, setShowEvaluation] = useState(false)

    // Check if we have extracted text (from localStorage or processing)
    const hasData = extractedText.model && extractedText.student

    // If no data at all, redirect to home
    useEffect(() => {
        if (!hasData) {
            navigate('/', { replace: true })
        }
    }, [hasData, navigate])

    // Show loading while checking
    if (!hasData) {
        return (
            <div className="Summary">
                <div className="loading">Loading your data...</div>
            </div>
        )
    }

    // If we have text data but no files (after reload), show message
    if (!fileData.modelFile || !fileData.studentFile) {
        return (
            <div className="Summary">
                <h2 className="Summary__title">Extracted Answer Text Review</h2>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h3>Your processed data is available, but files cannot be displayed after page reload.</h3>
                    <p>The extracted text and evaluation are still available below.</p>
                    <button
                        onClick={() => {
                            clearProcessedData()
                            navigate('/', { replace: true })
                        }}
                        style={{
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '20px'
                        }}
                    >
                        Start New Analysis
                    </button>
                </div>
                <Evaluation />
            </div>
        )
    }

    // Normal case: we have both files and text
    return (
        <div className="Summary">
            <div className="Summary__header">
                <h2 className="Summary__title">Extracted Answer Text Review</h2>
                <div className="Summary__actions">
                    <button
                        onClick={() => {
                            clearProcessedData()
                            navigate('/', { replace: true })
                        }}
                        className="Summary__upload-btn"
                    >
                        📤 Upload New Files
                    </button>
                    <button
                        onClick={() => {
                            clearProcessedData()
                            navigate('/', { replace: true })
                        }}
                        className="Summary__reset-btn"
                    >
                        🔄 Start Fresh
                    </button>
                </div>
            </div>

            <div className="Summary__files--container">
                <SummaryFileDisplay
                    type="Model"
                    pdfFile={fileData.modelFile}
                />
                <SummaryFileDisplay
                    type="Student"
                    pdfFile={fileData.studentFile}
                />
            </div>

            {!showEvaluation && (
                <div className="Summary__compare-section">
                    <button
                        onClick={() => setShowEvaluation(true)}
                        className="Summary__compare-btn"
                    >
                        🔍 Compare Answers & Generate Report
                    </button>
                    <p className="Summary__compare-desc">
                        Click to analyze the extracted text and generate a comprehensive evaluation report
                    </p>
                </div>
            )}

            {showEvaluation && <Evaluation />}
        </div>
    )
}

export default Summary