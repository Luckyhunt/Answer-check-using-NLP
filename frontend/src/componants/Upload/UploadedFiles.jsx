import useFileContext from "../../StateManager/FileContext"

import { CiFileOn } from "react-icons/ci"
import { RxCrossCircled } from "react-icons/rx"
import { FaFilePdf, FaFileImage, FaFileWord, FaFileAlt } from "react-icons/fa"
import { AiOutlineDelete } from "react-icons/ai"

import "./UploadedFiles.css"

const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()

    switch (extension) {
        case 'pdf':
            return <FaFilePdf />
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'bmp':
            return <FaFileImage />
        case 'docx':
        case 'doc':
            return <FaFileWord />
        case 'txt':
            return <FaFileAlt />
        default:
            return <CiFileOn />
    }
}

const getFileTypeColor = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()

    switch (extension) {
        case 'pdf':
            return '#dc3545'
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'bmp':
            return '#28a745'
        case 'docx':
        case 'doc':
            return '#007bff'
        case 'txt':
            return '#6c757d'
        default:
            return '#6c757d'
    }
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const FileComponent = ({ file, type, onRemove }) => {
    const fileIcon = getFileIcon(file.name)
    const fileColor = getFileTypeColor(file.name)
    const fileSize = formatFileSize(file.size)
    const fileExtension = file.name.split('.').pop().toUpperCase()

    return (
        <div className="FileComponent">
            <div className="FileComponent__icon" style={{ color: fileColor }}>
                {fileIcon}
            </div>
            <div className="FileComponent__info">
                <div className="FileComponent__name" title={file.name}>
                    {file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name}
                </div>
                <div className="FileComponent__details">
                    <span className="FileComponent__size">{fileSize}</span>
                    <span className="FileComponent__type">{fileExtension}</span>
                </div>
            </div>
            <div className="FileComponent__actions">
                <button
                    className="FileComponent__remove"
                    onClick={() => {
                        if (window.confirm(`Remove ${file.name}?`)) {
                            onRemove()
                        }
                    }}
                    title="Remove file"
                >
                    <AiOutlineDelete />
                </button>
            </div>
        </div>
    )
}

const UploadedFiles = () => {
    const { fileData, removeStudentFile, removeModelFile } = useFileContext()

    return (
        <div className="UploadedFiles">
            <div className="UploadedFiles__container">
                <div className="UploadedFiles__section">
                    <div className="UploadedFiles__title">
                        <span className="UploadedFiles__title-icon">📋</span>
                        Model Answer Sheet
                    </div>
                    <div className="UploadedFiles__content">
                        {fileData.modelFile ?
                            <FileComponent
                                file={fileData.modelFile}
                                type="model"
                                onRemove={removeModelFile}
                            />
                            :
                            <div className="UploadedFiles__empty">
                                <div className="UploadedFiles__empty-icon">
                                    <RxCrossCircled />
                                </div>
                                <div className="UploadedFiles__empty-text">
                                    <strong>No model file uploaded</strong>
                                    <span>Please upload the official answer key first</span>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <div className="UploadedFiles__section">
                    <div className="UploadedFiles__title">
                        <span className="UploadedFiles__title-icon">📝</span>
                        Student Answer Sheet
                    </div>
                    <div className="UploadedFiles__content">
                        {fileData.studentFile ?
                            <FileComponent
                                file={fileData.studentFile}
                                type="student"
                                onRemove={removeStudentFile}
                            />
                            :
                            <div className="UploadedFiles__empty">
                                <div className="UploadedFiles__empty-icon">
                                    <RxCrossCircled />
                                </div>
                                <div className="UploadedFiles__empty-text">
                                    <strong>No student file uploaded</strong>
                                    <span>Please upload the student's answer sheet</span>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UploadedFiles
