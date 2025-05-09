import { Lightbulb, Volume2 } from "lucide-react";
import React from "react";

const QuestionSection = ({ mockInterviewQuestion, activeQuestionIndex }) => {
  const textToSpeech = (text) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Sorry, your browser does not support text to speech.");
    }
  };
  return (
    mockInterviewQuestion && (
      <div className=" flex flex-col justify-between p-5 border rounded-lg my-1 shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 p-2">
          {mockInterviewQuestion &&
            mockInterviewQuestion.map((question, index) => (
              <h2
                className={`p-2  rounded-full text-center text-xs md:text-sm cursor-pointer md:block hidden ${
                  activeQuestionIndex == index
                    ? "bg-orange-500 text-white"
                    : "bg-secondary"
                }`}
              >
                Question {index + 1}
              </h2>
            ))}
        </div>
        <h2 className="my-5 text-md md:text-lg">
          {mockInterviewQuestion[activeQuestionIndex]?.Question}
        </h2>
        <Volume2
          className="cursor-pointer"
          onClick={() =>
            textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.Question)
          }
        />
        <div className="border rounded-lg p-5 bg-blue-100 mt-18 md:block hidden">
          <h2 className="flex gap-2 items-center text-blue-800">
            <Lightbulb />
            <strong>Note:</strong>
          </h2>
          <h2 className="text-sm text-blue-600 my-2">
            {/* {process.env.NEXT_PUBLIC_QUESTION_NOTE} */}
            You will be asked 10 questions. Each question will have 2 minutes for you to answer. You can only answer each question once. Once you have answered a question, you cannot go back to it. You must move on to the next question after answering the current one. The interview cannot be paused once started, and skipping a question is not allowed.
            <br/>Additionally, you must record your answer for each question. If no answer is recorded, it will be treated as an empty response.
          </h2>
        </div>
      </div>
    )
  );
};

export default QuestionSection;