import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import Hero from "../../componants/Hero/Hero"
import Upload from "../../componants/Upload/Upload"
import Working from "../../componants/Working/Working"
import useTextExtractionContext from "../../StateManager/TextExtraction"

const Home = () => {
    const navigate = useNavigate()
    const { extractedText } = useTextExtractionContext()
    const [hasPreviousResults, setHasPreviousResults] = useState(false)

    useEffect(() => {
        const hasProcessedData = localStorage.getItem('hasProcessedData')
        const hasExtractedText = extractedText.model && extractedText.student

        if (hasProcessedData === 'true' && hasExtractedText) {
            setHasPreviousResults(true)
        }
    }, [extractedText])

    return (
        <div className="Home">
            <Hero />
            <Upload />
            {hasPreviousResults && (
                <div style={{
                    textAlign: 'center',
                    margin: '20px 0',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                    borderRadius: '12px',
                    border: '2px solid #2196f3'
                }}>
                    <h3 style={{ color: '#1976d2', marginBottom: '10px' }}>
                        📊 Previous Results Available
                    </h3>
                    <p style={{ marginBottom: '15px', color: '#555' }}>
                        You have processed files with evaluation results ready to view.
                    </p>
                    <button
                        onClick={() => navigate('/summary')}
                        style={{
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        View Previous Results
                    </button>
                </div>
            )}
            <Working />
        </div>
    )
}

export default Home
