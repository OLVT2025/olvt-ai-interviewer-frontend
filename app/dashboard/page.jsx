import { UserButton } from "@clerk/nextjs";
import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  return (
    <div className="p-10" >
      {/* <h2 className="font-bold text-2xl" >Dashboard</h2>
      <h2 className="text-gray-500" >Create and start your AI Mockup Interview</h2> */}

      {/* <div className="grid grid-cols-1 md:grid-cols-3 my-5" > */}
        <AddNewInterview/>
      {/* </div> */}
      <div className="max-w-4xl p-6 bg-card rounded-2xl shadow-md hover:shadow-lg ">
        <InterviewList/>
      </div>
      
    </div>
  );
};

export default Dashboard;
