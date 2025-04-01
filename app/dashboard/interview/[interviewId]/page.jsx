"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, TriangleAlert, UserCheck, WebcamIcon } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import Link from "next/link";
import { useContext } from 'react';
import { WebCamContext } from "../../layout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import recordingService from "@/utils/recordingService";

const Interview = ({ params }) => {
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const [interviewData, setInterviewData] = useState();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    console.log(params.interviewId);
    GetInterviewDetails();
    checkPermissions();
  }, []);

  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));
      
    setInterviewData(result[0]);
  };

  const checkPermissions = async () => {
    try {
      // Request access to both camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPermissionsGranted(true);
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after checking
      
      // Initialize recording service but don't start recording yet
      const initialized = await recordingService.initialize(params.interviewId);
      setIsInitialized(initialized);
    } catch (error) {
      console.error("Permission error:", error);
      setPermissionsGranted(false);
      setIsInitialized(false);
    }
  };

  const handleStartInterview = () => {
    if (!permissionsGranted) {
      toast.error("Please enable camera and microphone permissions");
      checkPermissions(); // Try to request permissions again
      return;
    }
    
    // Navigate to interview start page
    router.push(`/dashboard/interview/${params.interviewId}/start`);
  };

  return (
    <div className="my-10">
      <h2 className="font-bold text-2xl text-center">Let's Get Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 ">
        <div className="flex flex-col my-5 gap-5">
          <div className="flex flex-col p-5 h-full w-full rounded-lg border gap-5">
            <h2 className="text-md">
              <strong>Name of Candidate: </strong>
              {interviewData?.name}
            </h2>
            <h2 className="text-md">
              <strong>Job Role/Job Position: </strong>
              {interviewData?.jobPosition}
            </h2>
            <h2 className="text-md">
              <strong>Job Description/Job Stack: </strong>
              {interviewData?.jobDesc}
            </h2>
            <h2 className="text-md">
              <strong>Years of Experience: </strong>
              {interviewData?.jobExperience}
            </h2>
          </div>
        </div>
        <div>
          {permissionsGranted ? (
            <div className="bg-secondary border w-full my-6 p-2 rounded-lg justify-between items-center">
              <Webcam
                onUserMedia={() => setWebCamEnabled(true)}
                onUserMediaError={() => setWebCamEnabled(false)}
                mirrored={true}
              />
              <div className="items-center justify-center flex p-2 rounded-lg bg-yellow-50 text-xs">
                <UserCheck color="#d8db00" className="mr-2" />
                <span>Permissions Granted</span>
              </div>
            </div>
          ) : (
            <div className=" bg-secondary border w-full my-6 p-2 rounded-lg justify-between items-center">
              <WebcamIcon color="#4b4949" className="h-72 w-full" />
              <div className="flex items-center justify-center p-2 rounded-lg bg-yellow-50 text-xs">
                <TriangleAlert color="#d8db00" className="mr-2" />
                <span>Please enable camera and microphone before starting interview.</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-5 mb-4 border rounded-lg border-[#f3d268] bg-[#fffef1]">
        {/* <div dangerouslySetInnerHTML={{ __html: process.env.NEXT_PUBLIC_INFORMATION }} />
         */}
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-yellow-800">
              <span class="font-bold text-lg">⚠️ Important Guidelines</span>
          </div>

          <div class="space-y-3">
              <div class="flex items-start gap-2">
                  <span class="text-yellow-700">🎥</span>
                  <div>
                      <p class="font-semibold">Camera & Microphone</p>
                      <p>Keep your camera and microphone ON throughout the interview. Turning off either will result in immediate disqualification.</p>
                  </div>
              </div>

              <div class="flex items-start gap-2">
                  <span class="text-yellow-700">⏱️</span>
                  <div>
                      <p class="font-semibold">Time Management</p>
                      <p>• 5 questions in total</p>
                      <p>• 2 minutes per question</p>
                      <p>• Each question can be answered only once</p>
                  </div>
              </div>

              <div class="flex items-start gap-2">
                  <span class="text-yellow-700">🎯</span>
                  <div>
                      <p class="font-semibold">Recording Process</p>
                      <p>• Click 'Record' button to start your answer</p>
                      <p>• Recording automatically stops after 2 minutes</p>
                      <p>• Navigate to the next question</p>
                  </div>
              </div>

              <div class="flex items-start gap-2">
                  <span class="text-yellow-700">⛔</span>
                  <div>
                      <p class="font-semibold">Strict Proctoring</p>
                      <p>This interview is strictly proctored. Any unfair means detected will lead to immediate disqualification.</p>
                  </div>
              </div>
        </div>
      </div>
      </div>
      <div className="flex justify-center my-4 md:my-0 md:justify-end md:items-end">
        {permissionsGranted ? (
          <Button 
            onClick={() => handleStartInterview()}
            className="bg-orange-500 hover:bg-orange-600 text-white hover:shadow-[0_4px_6px_rgba(255,165,0,0.5)] shadow-lg"
          >
            Start Interview
          </Button>
        ) : (
          <Button
            onClick={() => {
              toast.error("Enable Microphone and Camera");
              checkPermissions(); // Try to request permissions again
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white hover:shadow-[0_4px_6px_rgba(255,165,0,0.5)] shadow-lg"
          >
            Start Interview
          </Button>
        )}
      </div>
    </div>
  );
};

export default Interview;