"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useContext, useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { WebCamContext } from "@/app/dashboard/layout";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Timer from "./Timer";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  candidateDetails,
  setIsAnswerSaved,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const updateCalledRef = useRef(false);
  const [timerExpired, setTimerExpired] = useState(false);

  const [stopManual, setStopManual]= useState(false);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  useEffect(() => {
    setIsRecording(false);
    setUserAnswer("");
    setTimerExpired(false);  // Make sure this line is present
    setLoading(false);       // Also reset loading state
    setStopManual(false);
    updateCalledRef.current = false;
    setIsAnswerSaved(false);
    console.log("checling ndsjkgnasdjgbn", setIsAnswerSaved);
  }, [activeQuestionIndex]);

  console.log("timer rest or noltng",timerExpired);

  const handleTimeUp = async () => {
    console.log("handleTimeUp triggered:");
    stopRecording();
    if (userAnswer.length > 10 && !updateCalledRef.current) {
      await updateUserAnswer();
      updateCalledRef.current = true;
      console.log("User answer saved:", userAnswer);
    }
  
  };
  
  
  // Also modify transcribeAudio to not trigger an immediate update
  const transcribeAudio = async (audioBlob) => {
    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        const result = await model.generateContent([
          "Transcribe the following audio:",
          { inlineData: { data: base64Audio, mimeType: "audio/webm" } },
        ]);
  
        const transcription = result.response.text();
        setUserAnswer((prevAnswer) => prevAnswer + " " + transcription);
        setLoading(false);
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast("Error transcribing audio. Please try again.");
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast("Error starting recording. Please check your microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      console.log("stop rec called ...");
      setIsRecording(false);
      setTimerExpired(true);
      setStopManual(true);
      // handleTimeUp();
    }
  };

  const updateUserAnswer = async () => {
    if (loading) return; // Prevent multiple calls while loading
    try {
      setLoading(true);
      const feedbackPrompt =
        "Question:" +
        mockInterviewQuestion[activeQuestionIndex]?.Question +
        ", User Answer:" +
        userAnswer +
        " , Depends on question and user answer with the known details as"+
        candidateDetails +
        " and given interview question" +
        " please give us rating for answer and feedback on the interviewee " +
        "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

      const result = await chatSession.sendMessage(feedbackPrompt);

      let MockJsonResp = result.response.text();
      console.log(MockJsonResp);

      // Removing possible extra text around JSON
      MockJsonResp = MockJsonResp.replace("```json", "").replace("```", "");

      // Attempt to parse JSON
      let jsonFeedbackResp;
      try {
        jsonFeedbackResp = JSON.parse(MockJsonResp);
      } catch (e) {
        throw new Error("Invalid JSON response: " + MockJsonResp);
      }
      console.log("this is the user answer    djfnsdkjbf",userAnswer);
      
      const resp = await db.insert(UserAnswer)
        .values({
          mockIdRef: interviewData?.mockId,
          question: mockInterviewQuestion[activeQuestionIndex]?.Question,
          correctAns: mockInterviewQuestion[activeQuestionIndex]?.Answer,
          userAns: userAnswer,
          feedback: jsonFeedbackResp?.feedback,
          rating: jsonFeedbackResp?.rating,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format("YYYY-MM-DD"),
        })
        .returning();  // This will return all columns

      console.log("dnvjksnd kjsbfk sdkhjv ", resp);

      if (resp) {
        toast("User Answer recorded successfully");
        setIsAnswerSaved(true);
      }
      setUserAnswer("");
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast("An error occurred while recording the user answer");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center overflow-hidden">
      <div className="mb-4">
        <Timer key={activeQuestionIndex} duration={120} onTimeUp={handleTimeUp} stopManual={stopManual}/>
      </div>
      <div className="flex flex-col justify-center items-center rounded-lg p-5 bg-black mt-4 w-[30rem] ">
        {webCamEnabled ? (
          <Webcam
            mirrored={true}
            style={{ height: 300, width: "100%", zIndex: 10 }}
          />
        ) : (
          <Image src={"/camera.jpg"} width={200} height={200} alt="Camera placeholder" />
        )}
      </div>
      <div className="md:flex mt-4 md:mt-8 md:gap-2">
        <div className="my-4 md:my-0">
          <Button onClick={() => setWebCamEnabled((prev) => !prev)} className="bg-orange-500 hover:bg-orange-600 text-white hover:shadow-[0_4px_6px_rgba(255,165,0,0.5)] shadow-lg">
            {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
          </Button>
        </div>
        <Button
          variant="outline"
          // onClick={isRecording ? ()=>{setStopManual(true)} : startRecording}
          onClick={()=> {isRecording ? stopRecording() : startRecording()}}
          disabled={loading || timerExpired }
          className="bg-orange-500 hover:bg-orange-600 text-white hover:shadow-[0_4px_6px_rgba(255,165,0,0.5)] shadow-lg"
        >
          {isRecording ? (
            <h2 className="text-white flex gap-2 ">
              <Mic /> Stop Recording...
            </h2>
          ) : (
            " Record Answer"
          )}
        </Button>

      </div>
      {timerExpired && (
        <div className="mt-4 text-red-500">
          Time's up! Your answer has been recorded.
        </div>
      )}
      {/* Check transcription code */}
      {/* {userAnswer && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold">Transcribed Answer:</h3>
          <p>{userAnswer}</p>
        </div>
      )} */}
    </div>
  );
};

export default RecordAnswerSection;