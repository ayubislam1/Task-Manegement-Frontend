import React from "react";
import { motion } from "framer-motion";

export const PriceTag = ({ price, period, isPopular = false }) => {
  return (
    <motion.div 
      className="relative group"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
      
      <div className="relative px-6 py-4 bg-white dark:bg-gray-900 ring-1 ring-gray-200/50 dark:ring-gray-800/50 rounded-lg leading-none flex items-center">
        <div className="space-y-1">
          <p className="text-slate-800 dark:text-slate-200">
            <span className="text-3xl font-bold">${price}</span>
            <span className="text-slate-500 dark:text-slate-400 ml-2">/{period}</span>
          </p>
          {isPopular && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-3 right-4 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs px-3 py-1 rounded-full"
            >
              Popular
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};