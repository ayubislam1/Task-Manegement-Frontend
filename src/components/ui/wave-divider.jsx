import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const WaveDivider = ({ className = "", inverted = false }) => {
  const { scrollYProgress } = useScroll();
  const translateY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ 
          translateY: translateY,
          opacity 
        }}
      >
        <svg
          className="w-full"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: inverted ? 'rotate(180deg)' : 'none' }}
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d="M0 60C240 120 480 120 720 60C960 0 1200 0 1440 60V120H0V60Z"
            fill="currentColor"
            className="text-background"
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
            d="M0 60C240 120 480 120 720 60C960 0 1200 0 1440 60"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="2"
            fill="none"
            className="text-background"
          />
        </svg>
      </motion.div>
    </div>
  );
};