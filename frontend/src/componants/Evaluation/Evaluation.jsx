import { useState, useEffect } from "react"
import "./Evaluation.css"
import "./Metric.css"
import EvaluationSkeleton from "./EvaluationSkeleton"
import useTextExtractionContext from "../../StateManager/TextExtraction"

const Metric = ({ parameter, percent, percentSign = true }) => {

    const displayPercent = percent > 100 ? 100 : percent
    return (
        <div className="Metric">
            <div className="Metric__top">
                <span className="Metric__parameter">{ parameter }</span>
                <span className="Metric__percent">
                    { `${percent}` }{ percentSign && "%"}
                </span>
            </div>
            <div className="Metric__meter">
                <div
                    className="Metric__bar"
                    style={{
                        width: `${displayPercent}%`,
                        backgroundColor: percent > 66 ? "#76ff76" : (percent > 33 ? "rgb(255 227 143)" : "rgb(255 84 100)")
                    }}
                ></div>
            </div>
        </div>
    )
}

const Evaluation = () => {

    const [ evaluation, setEvaluation ] = useState({
        keyword: 0,
        semantics: 0,
        tone: "",
        toneScore: 0
    })
    const { extractedText } = useTextExtractionContext()
    const [isMobile, setIsMobile] = useState(false)

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)

        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const wordCount = {
        model: extractedText.model.trim().split(/\s+/).length,
        student: extractedText.student.trim().split(/\s+/).length
    }

    const feedback = percent => {
        if (percent >= 0 && percent <= 30) {
            return "You have a lot more areas to cover."
        }
        else if (percent < 50) {
            return "Building the Basics"
        }
        else if (percent < 70) {
            return "On the Right Track"
        }
        else if (percent < 85) {
            return "Strong Effort, High Potential"
        }
        else {
            return "Mastery and Excellence"
        }
    }

    const sendAnswerRequest = async () => {
        const data = {
            model: extractedText.model,
            student: extractedText.student
        }
        console.log(data)
        try {
            const sendAnswers = await fetch("http://127.0.0.1:8000/evaluation", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(extractedText)
            })

            const response = await sendAnswers.json()
            console.log(response)
            setEvaluation({
                keyword: response.keyword,
                semantics: response.semantics,
                tone: response.tone,
                toneScore: response.toneScore
            })
        }
        catch (err) {
            console.log("You messed up in evaluation", err)
        }
    }

    // Calculate the final score on a 0-100 scale
    const finalScore =
        (0.1 * evaluation.keyword * 100) + // Scale 0-1 (e.g., 0.8) -> (0.1 * 80) = 8
        (0.7 * evaluation.semantics * 100) +
        (0.2 * evaluation.toneScore * 100);

    // Normalize back to 0-1 range for the bar logic (which uses testScore * 100)
    const testScore = finalScore / 100;

    // Calculate the display percentage once to ensure consistency
    const displayPercentage = Math.round(testScore * 100);

    useEffect(() => {
        sendAnswerRequest()
    }, [])

    return (
        evaluation.semantics === 0 ?
        <EvaluationSkeleton /> :
        <div className="Evaluation">
            <div className="Evaluation__title">
                Student Test Summary
            </div>
            <div className="Metrics">
                <Metric
                    parameter="Keywords"
                    percent={Math.round(evaluation.keyword * 100)}
                />
                <Metric
                    parameter="Semantics"
                    percent={Math.round(evaluation.semantics * 100)}
                />
                <Metric
                    parameter={`Tone: ${evaluation.tone}`}
                    percent={Math.round(evaluation.toneScore * 100)}
                />
                <Metric
                    parameter={`Word Count: ${wordCount.student}/${wordCount.model}`}
                    percent={Math.min(Math.round(wordCount.student / wordCount.model * 100), 100)}
                />
            </div>
            <div className="Evaluation__feedback">
                <h3 className="Evaluation__feedback__title">Test Results</h3>
                <div className="Evaluation__feedback__result">
                    <div className="Evaluation__feedback__percent">
                        { displayPercentage }%
                        <span>
                            { feedback(displayPercentage) }
                        </span>
                    </div>
                    <div
                        className="Evaluation__feedback__meter"
                    >
                        <div
                            className="Evaluation__feedback__bar"
                            style={
                                (() => {
                                    // Use the same percentage value as the display
                                    const percentValue = `${displayPercentage}%`;

                                    // If isMobile is true (short, wide container in CSS) -> fill horizontally (width)
                                    return isMobile
                                        ? {
                                              width: percentValue, // Percentage controls the WIDTH
                                              height: '100%',      // Bar fills meter height
                                              left: 0,             // Starts filling from the left
                                              bottom: 'auto'       // Ignore vertical alignment
                                          }
                                        : {
                                              // If isMobile is false (tall, narrow container in CSS) -> fill vertically (height)
                                              height: percentValue, // Percentage controls the HEIGHT
                                              width: '100%',        // Bar fills meter width
                                              bottom: 0             // Starts filling from the bottom
                                          };
                                })()
                            }
                        >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Evaluation