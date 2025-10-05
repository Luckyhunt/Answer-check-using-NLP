import { useEffect, useRef } from "react"
import useFileContext from "../../StateManager/FileContext"

import { CiCirclePlus } from "react-icons/ci"
import { FiUploadCloud } from "react-icons/fi"

import "./Dropbox.css"

const Dropbox = ({ type }) => {

    const inputRef = useRef(null)
    const { fileData, addStudentFile, addModelFile } = useFileContext()
    
    const handleModelFileChange = e => {
        const file = e.target.files[0]
        if (file) {
            addModelFile(file)
        }
    }

    const handleStudentFileChange = e => {
        const file = e.target.files[0]
        if (file) {
            addStudentFile(file)
        }
    }

    const handleContainerClick = () => {
        inputRef.current.click()
    }

    return (
        <div
            className="Dropbox"
            onClick={handleContainerClick}
        >
            <input
                onChange={(e) => {
                    if (type === "model") {
                        handleModelFileChange(e)
                    }
                    else {
                        handleStudentFileChange(e)
                    }
                }}
                className="Dropbox__input"
                type="file"
                accept=".pdf"
                id="fileInput"
                multiple={type !== "model"}
                ref={inputRef}
            />
            <div className="Dropbox__upload-icon">
                <FiUploadCloud />
            </div>
            <div className="Dropbox__title">
                {
                    type === "model" ?
                    <span>Model Answer Sheet</span> :
                    <span>Student Answer Sheet</span>
                }
            </div>
            <p className="Dropbox__desc">
                {
                    type === "model" ?
                    <span>Upload the official answer key for comparison</span> :
                    <span>Click to upload multiple student submissions.</span>
                }
            </p>
            <div className="Dropbox__plus-icon">
                <CiCirclePlus />
            </div>
        </div>
    )
}

export default Dropbox
