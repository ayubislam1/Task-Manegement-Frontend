"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundGradient = ({
	children,
	className,
	containerClassName,
}) => {
	return (
		<div className={cn("relative p-[4px] group", containerClassName)}>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="absolute inset-0 rounded-[22px] bg-gradient-to-r from-violet-500 to-indigo-500 group-hover:opacity-100 blur-xl transition duration-500"
			/>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-violet-500 to-indigo-500 group-hover:opacity-100"
			/>
			<div className={cn("relative", className)}>{children}</div>
		</div>
	);
};
