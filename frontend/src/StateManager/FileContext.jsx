import { createContext, useContext, useState } from "react"

export const FileContext = createContext(null)

export const FileProvider = ({ children }) => {
    const [ fileData, setFileData ] = useState({
        modelFile: null,
        studentFile: null,
        modelExtractedText: "",
        studentExtractedText: ""
    })

    const addStudentFile = file => {
        setFileData(prev => ({...prev, studentFile: file}))
    }

    const addModelFile = file => {
        setFileData(prev => ({...prev, modelFile: file}))
    }

    const value = {
        fileData,
        addStudentFile,
        addModelFile,
    }

    return (
        <FileContext.Provider value={value}>
            { children }
        </FileContext.Provider>
    )
}

const useFileContext = () => useContext(FileContext)
export default useFileContext
