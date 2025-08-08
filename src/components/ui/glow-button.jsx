import React from "react";
import { motion } from "framer-motion";

export const GlowButton = ({ children, className = "", ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative rounded-full overflow-hidden px-8 py-4
        bg-white text-gray-950 dark:bg-gray-900 dark:text-white
        shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]
        group
        ${className}
      `}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-purple-600/20" />
      
      <div className="absolute -inset-px bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 blur transition duration-500" />
      
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition duration-500" />
      
      <div className="relative flex items-center justify-center gap-2">
        {children}
      </div>
      
      <div className="absolute -inset-px bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-50 blur-xl transition duration-500" />
    </motion.button>
  );
};