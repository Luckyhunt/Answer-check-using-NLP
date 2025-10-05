import { useState, createContext, useContext, useEffect } from "react"

export const TextExtractionContext = createContext(null)

export const TextExtractionContextProvider = ({ children }) => {
    const [ extractedText, setExtractedText ] = useState({
        model: "",
        student: ""
    })

    // Load extracted text from localStorage on mount
    useEffect(() => {
        const savedText = localStorage.getItem('extractedText')
        if (savedText) {
            try {
                const parsed = JSON.parse(savedText)
                setExtractedText(parsed)
            } catch (error) {
                console.error('Error loading saved extracted text:', error)
            }
        }
    }, [])

    // Save extracted text to localStorage whenever it changes
    useEffect(() => {
        if (extractedText.model || extractedText.student) {
            localStorage.setItem('extractedText', JSON.stringify(extractedText))
        }
    }, [extractedText])

    const setModelText = text => {
        setExtractedText(prev => ({...prev, model: text}))
    }

    const setStudentText = text => {
        setExtractedText(prev => ({...prev, student: text}))
    }

    const clearText = () => {
        setExtractedText({
            model: "",
            student: ""
        })
        localStorage.removeItem('extractedText')
    }

    const value = {
        extractedText,
        setModelText,
        setStudentText,
        clearText
    }

    return (
        <TextExtractionContext.Provider value={value}>
            { children }
        </TextExtractionContext.Provider>
    )
}

const useTextExtractionContext = () => useContext(TextExtractionContext)
export default useTextExtractionContext
