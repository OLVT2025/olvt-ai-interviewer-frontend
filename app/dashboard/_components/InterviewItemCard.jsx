import React from 'react'
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const InterviewItemCard = ({interview}) => {

    const router = useRouter()
    const onStart = ()=>{
        router.push("/dashboard/interview/"+interview?.mockId)
    }
    const onFeedback = ()=>{
        router.push("/dashboard/interview/"+interview?.mockId+"/feedback")
    }
  return (
    // <div className="border border-gray-500 shadow-sm rounded-lg p-3 bg-gray-200" >
    //     <div className='flex'>
    //         <h2 className='font-bold text-primary' >{interview?.jobPosition}</h2>
    //         <h2 className="text-sm text-gray-400 justify-end" >{interview.createdAt}</h2>
    //     </div>
    //     <div className='flex-row'>
    //         <div className='flex-col'>
    //             <h2 className='text-sm text-gray-600' >{interview?.name}</h2>
    //             <h2 className='text-sm text-gray-600' >{interview?.jobExperience} Years of experience</h2>
    //         </div>
    //         <div className='flex justify-end mt-2 gap-5 ' >
    //             <Button onClick={onFeedback} size="sm"  className="w-full" >Feedback</Button>
    //             {/* <Button onClick={onStart} size="sm"  className="w-full">Start</Button> */}
    //         </div>
    //     </div>
    // </div>


    // <div className="border border-gray-100 shadow-sm rounded-lg py-2 px-3 bg-gray-50">
    //     <div className='flex justify-between items-start'>
    //         <h2 className='font-bold text-gray-700'>{interview?.jobPosition}</h2>
    //         <h2 className="text-sm text-gray-500 text-right">{interview.createdAt}</h2>
    //     </div>
    //     <div>
    //         <h2 className='text-sm font-medium text-gray-700'>{interview?.name}</h2>
    //         <h2 className='text-sm font-medium text-gray-500'>{interview?.jobExperience} Years of experience</h2>
    //     </div>
    //     <div className='mt-2'> {/* Added margin-top */}
    //         <Button 
    //         onClick={onFeedback} 
    //         size="sm"  
    //         className="py-1 px-3 bg-orange-100 text-orange-500 rounded-md" 
    //         >
    //         View Feedback
    //         </Button>
    //     </div>        
    // </div>

    <div className="border border-gray-300 shadow-sm rounded-lg py-2 px-3 bg-card hover:shadow-lg dark:bg-orange-50">
        <div className='flex justify-between items-start pb-2'>
            <h2 className='font-bold text-gray-700'>{interview?.jobPosition}</h2>
            <h2 className="text-sm text-gray-500 text-right">{interview.createdAt}</h2>
        </div>
        <div className='flex items-center justify-between'> {/* Key change: flex row */}
            <div> {/* Container for name and experience */}
                <h2 className='text-sm font-medium text-gray-700 pb-1'>{interview?.name}</h2>
                <h2 className='text-sm font-medium text-gray-500'>{interview?.jobExperience} years</h2>
            </div>
            <Button 
                onClick={onFeedback} 
                size="sm"  
                className="py-1 px-3 border-orange-200 bg-white hover:bg-white text-orange-500 rounded-md hover:shadow-[0_4px_6px_rgba(255,165,0,0.5)] transition-all shadow-lg" 
            >
                View Feedback
            </Button>
        </div>        
    </div>

  )
}

export default InterviewItemCard