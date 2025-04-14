"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function RobotLoading({ text }: any) {
  const [progress, setProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md mx-auto">
        <div className="relative h-60 mb-8">
          {/* Robot Head */}
          <motion.div
            className="absolute w-20 h-16 bg-black rounded-t-lg left-1/2 transform -translate-x-1/2"
            style={{ top: "20px" }}
            animate={{
              x: ["-50%", "-30%", "-50%", "-70%", "-50%"],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {/* Robot Eyes */}
            <div className="absolute flex space-x-2 left-1/2 transform -translate-x-1/2 top-3">
              <motion.div
                className="w-3 h-3 bg-white rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="w-3 h-3 bg-white rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.5,
                }}
              />
            </div>

            {/* Robot Antenna */}
            <div className="absolute w-1 h-4 bg-black left-1/2 transform -translate-x-1/2 -top-4">
              <div className="w-2 h-2 bg-black rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2" />
            </div>
          </motion.div>

          {/* Robot Body */}
          <motion.div
            className="absolute w-28 h-24 bg-black rounded-md left-1/2 transform -translate-x-1/2"
            style={{ top: "36px" }}
            animate={{
              x: ["-50%", "-30%", "-50%", "-70%", "-50%"],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {/* Robot Control Panel */}
            <div className="absolute w-16 h-8 bg-white rounded-sm left-1/2 transform -translate-x-1/2 top-4">
              <motion.div
                className="absolute w-2 h-2 bg-black rounded-full left-2 top-3"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute w-2 h-2 bg-black rounded-full right-2 top-3"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.5,
                }}
              />
            </div>
          </motion.div>

          {/* Robot Arms */}
          <motion.div
            className="absolute w-6 h-16 bg-black left-1/2 transform -translate-x-[72px]"
            style={{ top: "40px" }}
            animate={{
              x: ["-0%", "20%", "-0%", "-20%", "-0%"],
              rotate: [0, -15, 0, 15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute w-6 h-16 bg-black left-1/2 transform translate-x-[40px]"
            style={{ top: "40px" }}
            animate={{
              x: ["0%", "-20%", "0%", "20%", "0%"],
              rotate: [0, 15, 0, -15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          {/* Robot Legs */}
          <motion.div
            className="absolute w-8 h-20 bg-black left-1/2 transform -translate-x-[20px]"
            style={{ top: "60px" }}
            animate={{
              x: ["-0%", "10%", "-0%", "-10%", "-0%"],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute w-8 h-20 bg-black left-1/2 transform translate-x-[12px]"
            style={{ top: "60px" }}
            animate={{
              x: ["0%", "-10%", "0%", "10%", "0%"],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          {/* Ground Shadow */}
          <motion.div
            className="absolute w-32 h-4 bg-black opacity-20 rounded-full left-1/2 transform -translate-x-1/2"
            style={{ top: "140px" }}
            animate={{
              x: ["-50%", "-30%", "-50%", "-70%", "-50%"],
              scaleX: [1, 0.9, 1, 0.9, 1],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Loading Text */}
        <div className="text-center mb-4">
          <motion.p
            className="text-lg font-mono text-black"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            {text ? text : "Fetching Data"}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                delay: 0.5,
              }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                delay: 1,
              }}
            >
              .
            </motion.span>
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div
            className="bg-black h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-right mt-1 text-gray-600">{progress}%</p>
      </div>
    </div>
  );
}
