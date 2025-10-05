import { useState, createContext, useContext } from "react"

export const TextExtractionContext = createContext(null)

export const TextExtractionContextProvider = ({ children }) => {
    const [ extractedText, setExtractedText ] = useState({
        model: "",
        student: ""
    })

    const setModelText = text => {
        setExtractedText(prev => ({...prev, model: text}))
    }

    const setStudentText = text => {
        setExtractedText(prev => ({...prev, student: text}))
    }

    const value = {
        extractedText,
        setModelText,
        setStudentText
    }

    return (
        <TextExtractionContext.Provider value={value}>
            { children }
        </TextExtractionContext.Provider>
    )
}

const useTextExtractionContext = () => useContext(TextExtractionContext)
export default useTextExtractionContext
