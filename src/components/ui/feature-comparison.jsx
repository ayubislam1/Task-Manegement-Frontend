import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { GlowButton } from "./glow-button";
import { PriceTag } from "./price-tag";

const features = [
  {
    name: "Task Management",
    free: true,
    pro: true,
    description: "Create, organize, and track tasks efficiently"
  },
  {
    name: "Team Collaboration",
    free: true,
    pro: true,
    description: "Work together with team members in real-time"
  },
  {
    name: "Priority Settings",
    free: true,
    pro: true,
    description: "Set task priorities and deadlines"
  },
  {
    name: "Advanced Analytics",
    free: false,
    pro: true,
    description: "Detailed insights and performance metrics"
  },
  {
    name: "Custom Workflows",
    free: false,
    pro: true,
    description: "Create and customize task workflows"
  },
  {
    name: "API Access",
    free: false,
    pro: true,
    description: "Access to our REST API for integrations"
  }
];

export const FeatureComparison = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("free");

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-3 gap-4 p-4">
        <div className="col-span-1" />
        <div className="relative p-6 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-violet-500/20 dark:border-violet-500/10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            initial={false}
            animate={{ opacity: selectedPlan === "free" ? 0.1 : 0 }}
          />
          <h3 className="text-xl font-semibold mb-2 text-center">Free</h3>
          <div className="mb-4">
            <PriceTag price="0" period="month" />
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-4">Get Started</p>
          <GlowButton
            className="mt-4 w-full"
            onClick={() => setSelectedPlan("free")}
          >
            Choose Free
          </GlowButton>
        </div>
        <div className="relative p-6 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-violet-500/20 dark:border-violet-500/10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            initial={false}
            animate={{ opacity: selectedPlan === "pro" ? 0.1 : 0 }}
          />
          <h3 className="text-xl font-semibold mb-2 text-center">Pro</h3>
          <div className="mb-4">
            <PriceTag price="29" period="month" isPopular={true} />
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-4">Unlock All Features</p>
          <GlowButton
            className="mt-4 w-full"
            onClick={() => setSelectedPlan("pro")}
          >
            Choose Pro
          </GlowButton>
        </div>
      </div>

      <div className="space-y-2 mt-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.name}
            className="grid grid-cols-3 gap-4 p-4 rounded-lg transition-colors relative overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setHoveredFeature(feature.name)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="col-span-1 relative z-10">
              <h4 className="font-medium text-gray-900 dark:text-white">{feature.name}</h4>
              <p className={`text-sm text-zinc-600 dark:text-zinc-400 transition-all duration-300 ${
                hoveredFeature === feature.name ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'
              }`}>
                {feature.description}
              </p>
            </div>
            
            <div className="flex justify-center items-center relative z-10">
              {feature.free ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </motion.div>
              ) : (
                <XCircle className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
              )}
            </div>
            
            <div className="flex justify-center items-center relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};