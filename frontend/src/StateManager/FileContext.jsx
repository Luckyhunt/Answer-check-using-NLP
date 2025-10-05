import { createContext, useContext, useState, useEffect } from "react"

export const FileContext = createContext(null)

export const FileProvider = ({ children }) => {
    const [ fileData, setFileData ] = useState({
        modelFile: null,
        studentFile: null
    })

    const addStudentFile = file => {
        setFileData(prev => ({...prev, studentFile: file}))
    }

    const addModelFile = file => {
        setFileData(prev => ({...prev, modelFile: file}))
    }

    const clearProcessedData = () => {
        localStorage.removeItem('hasProcessedData')
        localStorage.removeItem('extractedText')
        setFileData({
            modelFile: null,
            studentFile: null
        })
    }

    const removeStudentFile = () => {
        setFileData(prev => ({...prev, studentFile: null}))
    }

    const removeModelFile = () => {
        setFileData(prev => ({...prev, modelFile: null}))
    }

    const value = {
        fileData,
        addStudentFile,
        addModelFile,
        removeStudentFile,
        removeModelFile,
        clearProcessedData
    }

    return (
        <FileContext.Provider value={value}>
            { children }
        </FileContext.Provider>
    )
}

const useFileContext = () => useContext(FileContext)
export default useFileContext
