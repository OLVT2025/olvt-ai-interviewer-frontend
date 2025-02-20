"use client";
import React, { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

const AddNewInterview = () => {
  const [openDailog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [name, setName] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience, setJobExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    console.log(jobPosition, jobDesc, jobExperience);

    const InputPrompt = `
  Job Positions: ${jobPosition}, 
  Job Description: ${jobDesc}, 
  Years of Experience: ${jobExperience}. 
  Based on this information, please provide 5 interview questions with answers. Question should be of varying difficulty starting with easy to difficult According to the year of experience. Each question will be answered in 2 min by the interviewee.  Provide in JSON format, ensuring "Question" and "Answer" are fields in the JSON.
`;

    const result = await chatSession.sendMessage(InputPrompt);
    const MockJsonResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "")
      .trim();
    console.log(JSON.parse(MockJsonResp));
    // const parsedResp = MockJsonResp
    setJsonResponse(MockJsonResp);

    if (MockJsonResp) {
      const resp = await db
        .insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: MockJsonResp,
          name: name,
          jobPosition: jobPosition,
          jobDesc: jobDesc,
          jobExperience: jobExperience,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format("YYYY-MM-DD"),
        })
        .returning({ mockId: MockInterview.mockId });
        
      console.log("Inserted ID:", resp);

      if (resp) {
        setOpenDialog(false);
        router.push("/dashboard/interview/" + resp[0]?.mockId);
      }
    } else {
      console.log("ERROR");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mb-10 p-6 bg-card rounded-2xl shadow-md hover:shadow-lg dark:bg-orange-50">
      <h2 className="text-2xl font-bold dark:text-black">Provide details about your job interview</h2>
      <p className="text-muted-foreground">Add specifics about your role, job functions, and duration of experience.</p>
      <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 ">
      
        <div>
          <label className="block font-semibold text-gray-700">Name</label>
          <Input 
          type="text" 
          placeholder="Enter Name" 
          onChange={(e) => setName(e.target.value)} 
          required
          className="dark:bg-orange-200"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700">Job Title</label>
          <Input
            type="text"
            placeholder="Full Stack Developer"
            value={jobPosition}
            onChange={(e) => setJobPosition(e.target.value)} 
            required
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700">Years of Experience</label>
          <Input
            type="text"
            placeholder="Ex. 4 years"
            value={jobExperience}
            onChange={(e) => setJobExperience(e.target.value)} 
            required
          />
        </div>
        <div className="md:col-span-3">
          <label className="block font-semibold text-gray-700">Job Description</label>
          <Textarea
            placeholder="Ex. React, Angular, Nodejs, MySQL, NoSQL, Python"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)} 
            required
          />
        </div>
        
      </div>
      
      <div className="flex justify-end mt-6 space-x-4">
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white hover:shadow-[0_4px_6px_rgba(255,165,0,0.5)] shadow-lg"  disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="animate-spin" />
              Generating From AI
            </>
          ) : (
            "Create Interview"
          )}
          </Button>
      </div>
      </form>
    </div>
  );
};

export default AddNewInterview;
