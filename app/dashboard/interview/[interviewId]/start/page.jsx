// dashboard/interview/[interviewId]/start/page.jsx
"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useState, useEffect } from "react";
import QuestionSection from "./_components/QuestionSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import recordingService from "@/utils/recordingService";
import { useAuth } from "@clerk/nextjs";

const StartInterview = ({ params }) => {
  const [interviewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [candidateDetails, setCandidateDetails] = useState();
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const { isLoaded, userId } = useAuth();
  const [isAnswerSaved, setIsAnswerSaved] = useState(false);


  const initializeInterview = async () => {
    try {
      requestFullscreen();
      await GetInterviewDetails();
      const initialized = await recordingService.initialize(params.interviewId);
      setIsInitialized(initialized);
      if (initialized) {
        await startRecordingProcess();
      }
    } catch (error) {
      console.error("Error initializing interview:", error);
      toast.error("Failed to initialize interview. Please refresh and try again.");
    }
  };

  useEffect(() => {
    initializeInterview();
    requestFullscreen();
    GetInterviewDetails();
    startRecordingProcess();
    
    // Event listener for visibilitychange
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab is visible");
      } else {
        setTabSwitchCount(prevCount => {
          const newCount = prevCount + 1;
          updateTabSwitchCountInDB(newCount);
          return newCount;
        });
        console.log("Tab is not visible");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Only stop recording if we're navigating away without clicking End Interview
      if (isRecording) {
        stopRecordingProcess(false);
      }
    };
  }, []);

  // const startRecordingProcess = async () => {
  //   try {
  //     const success = await recordingService.startRecording();
  //     if (success) {
  //       setIsRecording(true);
  //       console.log("Interview recording started");
  //     } else {
  //       toast.error("Failed to start recording. Please check permissions and try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error starting recording:", error);
  //     toast.error("Error starting recording");
  //   }
  // };

  const startRecordingProcess = async () => {
    try {
      if (!isInitialized) {
        await recordingService.initialize(params.interviewId);
      }
      
      const success = await recordingService.startRecording();
      if (success) {
        setIsRecording(true);
        console.log("Interview recording started");
      } else {
        toast.error("Failed to start recording. Please check permissions and try again.");
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Error starting recording. Please ensure permissions are granted.");
      
      // Attempt to reinitialize
      const reinitialized = await recordingService.initialize(params.interviewId);
      if (reinitialized) {
        toast.info("Reinitialized recording service. Please try starting again.");
      }
    }
  };

  // const stopRecordingProcess = async (isComplete = true) => {
  //   try {
  //     if (isRecording) {
  //       const success = await recordingService.stopRecording();
  //       setIsRecording(false);
        
  //       if (success && isComplete) {
  //         toast.success("Interview completed and recording saved!");
  //       } else if (!success) {
  //         toast.error("Failed to save recording. Please contact support.");
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error stopping recording:", error);
  //     toast.error("Error saving recording");
  //   }
  // };

  const stopRecordingProcess = async (isComplete = true) => {
    try {
      if (isRecording && recordingService.isInitialized) {
        const success = await recordingService.stopRecording();
        setIsRecording(false);
        
        if (success && isComplete) {
          toast.success("Interview completed and recording saved!");
        } else if (!success) {
          toast.error("Failed to save recording. Please contact support.");
        }
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      toast.error("Error saving recording");
    }
  };

  // Function to update tabSwitchCount in the database
  const updateTabSwitchCountInDB = async (newCount) => {
    await db
      .update(MockInterview)
      .set({ tabSwitchCount: newCount })
      .where(eq(MockInterview.mockId, params.interviewId));
  };

  // Function to request full-screen
  const requestFullscreen = () => {
    console.log("fullscreen called")
    if (!isFullscreen()) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    }
  };
  
  // Function to check if the document is in full-screen mode
  const isFullscreen = () => {
    return document.fullscreenElement !== null;
  };

  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));

    const jsonMockResp = JSON.parse(result[0].jsonMockResp);
    setCandidateDetails({
      jobDescription: result[0].jobDesc,
      yearsOfExperience: result[0].jobExperience
    });
    console.log(jsonMockResp);
    setMockInterviewQuestion(jsonMockResp);
    setInterviewData(result[0]);
  };

  const handleEndInterview = async () => {
    await stopRecordingProcess(true);
    // router.push(`/dashboard/interview/${params.interviewId}/feedback`);
    // Check if user is authorized
    if (userId) {
      // If authorized, redirect to feedback page
      router.push(`/dashboard/interview/${params.interviewId}/feedback`);
    } else {
      // If not authorized, redirect to thank you page
      router.push(`/dashboard/interview/${params.interviewId}/thank-you`);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 my-10 gap-2">
        {/* Question Section */}
        <QuestionSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
        />

        {/* Video/audio Recording */}
        <RecordAnswerSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
          candidateDetails={candidateDetails}
          isRecording={isRecording}
          setIsAnswerSaved={setIsAnswerSaved}
        />
      </div>
      <div className="flex gap-3 my-5 md:my-0 md:justify-end md:gap-6">
        {activeQuestionIndex !== (mockInterviewQuestion?.length - 1) && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
            className="bg-orange-500 hover:bg-orange-600 text-white hover:shadow-[0_4px_6px_rgba(255,165,0,0.5)] shadow-lg"
            disabled={!isAnswerSaved}
          >
            Next Question
          </Button>
        )}
        {activeQuestionIndex === (mockInterviewQuestion?.length - 1) && (
          <Button 
            onClick={handleEndInterview}
            className="bg-red-500 hover:bg-red-600 text-white hover:shadow-[0_4px_6px_rgba(255,0,0,0.5)] shadow-lg"
          >
            End Interview
          </Button>
        )}
      </div>
    </div>
  );
};

export default StartInterview;