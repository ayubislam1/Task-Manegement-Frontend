import React from "react";
import { motion } from "framer-motion";

export const SectionHeader = ({ 
  title, 
  description, 
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`text-center ${className}`}
    >
      <div className="relative">
        <motion.div
          className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-violet-500/20 via-transparent to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <h2 className={`relative text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 ${titleClassName}`}>
          {title}
        </h2>
      </div>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
          className={`mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto ${descriptionClassName}`}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
};