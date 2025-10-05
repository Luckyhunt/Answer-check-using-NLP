import { useRef } from "react"
import useFileContext from "../../StateManager/FileContext"

import { CiCirclePlus } from "react-icons/ci"
import { FiUploadCloud } from "react-icons/fi"

import "./Dropbox.css"

const Dropbox = ({ type }) => {
    const inputRef = useRef(null)
    const { fileData, addStudentFile, addModelFile } = useFileContext()

    const validateAndAddFile = (file, fileType) => {
        if (!file) return

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/bmp',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain'
        ]

        const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.docx', '.doc', '.txt']

        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            alert('Please select a supported file type: PDF, PNG, JPG, JPEG, GIF, BMP, DOCX, DOC, or TXT')
            return
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            alert('File size must be less than 10MB.')
            return
        }

        // Add file based on type
        if (fileType === "model") {
            addModelFile(file)
        } else {
            addStudentFile(file)
        }
    }

    const handleModelFileChange = e => {
        const file = e.target.files[0]
        validateAndAddFile(file, "model")
    }

    const handleStudentFileChange = e => {
        const file = e.target.files[0]
        validateAndAddFile(file, "student")
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
                accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.docx,.doc,.txt"
                id="fileInput"
                multiple={false}
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
                    <span>Upload the official answer key (PDF, DOCX, TXT, Images)</span> :
                    <span>Upload student's answer sheet (PDF, DOCX, TXT, Images)</span>
                }
            </p>
            <div className="Dropbox__plus-icon">
                <CiCirclePlus />
            </div>
        </div>
    )
}

export default Dropbox
