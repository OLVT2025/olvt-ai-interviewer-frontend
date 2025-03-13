import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const ThankYouPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Thank You for Completing the Interview!</h1>
      <p className="text-lg text-center mb-6">
        Your responses have been recorded. We appreciate your participation. <br />
        It is now safe to close the window.
      </p>
      {/* <Link href="/">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Return to Home
        </Button>
      </Link> */}
    </div>
  );
};

export default ThankYouPage;