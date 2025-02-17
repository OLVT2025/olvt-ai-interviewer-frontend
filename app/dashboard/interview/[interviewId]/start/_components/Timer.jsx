// // components/Timer.jsx
// import React, { useEffect, useState } from 'react';

// const Timer = ({ duration, onTimeUp }) => {
//   const [timeLeft, setTimeLeft] = useState(duration);

//   useEffect(() => {
//     if (timeLeft <= 0) {
//       onTimeUp();
//       return;
//     }

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => prev - 1);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeLeft, onTimeUp]);

//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = timeLeft % 60;

//   return (
//     <div className="text-xl font-bold">
//       {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
//     </div>
//   );
// };

// export default Timer;
// components/Timer.jsx
import React, { useEffect, useState } from 'react';

const Timer = ({ duration, onTimeUp, reset }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  // Reset timer when reset prop changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [reset, duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-xl font-bold">
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default Timer;