import React from "react";
import { motion } from "framer-motion";
import { Glass } from "./glass";
import { GlowButton } from "./glow-button";

export const CTASection = ({ onGetStarted, onLearnMore }) => {
  return (
    <Glass
      className="p-12 relative overflow-hidden"
      containerClassName="max-w-4xl mx-auto"
      animateOnScroll={true}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-indigo-500/10" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500/50 via-indigo-500/50 to-purple-500/50" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500/50 via-indigo-500/50 to-purple-500/50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 mb-6">
          Ready to Transform Your Workflow?
        </h2>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of teams who have already revolutionized their task management process. Start your journey today.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <GlowButton onClick={onGetStarted} className="min-w-[160px]">
            Get Started Free
          </GlowButton>
          <GlowButton 
            onClick={onLearnMore} 
            className="min-w-[160px] bg-white/50 dark:bg-gray-900/50"
          >
            Learn More
          </GlowButton>
        </div>
      </motion.div>

      <div className="absolute -bottom-1/2 left-0 right-0 h-48 bg-gradient-to-t from-violet-500/5 to-transparent pointer-events-none" />
    </Glass>
  );
};