import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Glass = ({ 
  children, 
  className = "", 
  hoverEffect = true,
  animateOnScroll = false,
  containerClassName = ""
}) => {
  return (
    <motion.div
      className={cn(
        "relative group",
        containerClassName
      )}
      initial={animateOnScroll ? { opacity: 0, y: 20 } : undefined}
      whileInView={animateOnScroll ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true }}
      whileHover={hoverEffect ? { scale: 1.02 } : undefined}
      transition={{ 
        duration: 0.3,
        scale: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
    >
      <div className="absolute inset-0 rounded-2xl transition duration-300 group-hover:duration-200">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-50 mask-gradient" />
      </div>

      <div className={cn(
        "relative rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/20 p-6 transition-colors",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.02)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
        className
      )}>
        {children}
      </div>
    </motion.div>
  );
};