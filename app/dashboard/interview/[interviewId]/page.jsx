"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, TriangleAlert, UserCheck, WebcamIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import Link from "next/link";
import { useContext } from 'react';
import { WebCamContext } from "../../layout";
import { toast } from "sonner";

const Interview = ({ params }) => {
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const [interviewData, setInterviewData] = useState();
  // const [webCamEnabled, setWebCamEnebled] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

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
    } catch (error) {
      setPermissionsGranted(false);
    }
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
          {/* <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-100">
            <div dangerouslySetInnerHTML={{ __html: process.env.NEXT_PUBLIC_INFORMATION }} />
          </div> */}
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
        <div dangerouslySetInnerHTML={{ __html: process.env.NEXT_PUBLIC_INFORMATION }} />
      </div>
      <div className="flex justify-center my-4 md:my-0 md:justify-end md:items-end">
        {permissionsGranted ? (
          <Link href={"/dashboard/interview/" + params.interviewId + "/start"}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white hover:shadow-[0_4px_6px_rgba(255,165,0,0.5)] shadow-lg"  >Start Interview</Button>
          </Link>
        ): (
          <Button
            onClick={() => {
              toast("Enable Microphone and Camera");
              setPermissionsGranted(false); // Force re-render for debugging
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
