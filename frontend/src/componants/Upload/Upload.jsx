import { useNavigate } from "react-router"

import useFileContext from "../../StateManager/FileContext"
import Dropbox from "./Dropbox"
import UploadedFiles from "./UploadedFiles"

import "./Upload.css"
import useTextExtractionContext from "../../StateManager/TextExtraction"

const Upload = () => {

    const navigation = useNavigate()

    const { fileData } = useFileContext()
    const { setModelText, setStudentText } = useTextExtractionContext()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (fileData.modelFile) {
            const formData1 = new FormData()
            const formData2 = new FormData()

            formData1.append("file", fileData.modelFile)
            formData2.append("file", fileData.studentFile)

            try {
                const sendModelFile = await fetch("http://127.0.0.1:8000/extractFileText", {
                    method: 'POST',
                    body: formData1
                })
                const modelResult = await sendModelFile.json()
                setModelText(modelResult.extracted_text)
                
                const sendStudentFiles = await fetch("http://127.0.0.1:8000/extractFileText", {
                    method: "POST",
                    body: formData2
                })
                const studentResult = await sendStudentFiles.json()
                setStudentText(studentResult.extracted_text)


                navigation("/summary")
            }
            
            catch (err) {
                console.log("You messed up in uploading file", err)
            }
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
                    disabled={!fileData.modelFile || !fileData.studentFile}
                >Process & Review Extracted Text</button>
            </div>
        </div>
    )
}

export default Upload
