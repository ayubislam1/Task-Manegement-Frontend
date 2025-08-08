import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Glass } from "./glass";

export const StatsCard = ({ value, label, duration = 2, delay = 0 }) => {
	const count = useMotionValue(0);
	const rounded = useTransform(count, (latest) => Math.round(latest));

	React.useEffect(() => {
		const controls = animate(count, value, {
			duration,
			delay,
			ease: "easeOut",
		});
		return controls.stop;
	}, [value]);

	return (
		<Glass animateOnScroll={true} className="relative overflow-hidden group">
			<motion.div
				className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
				initial={{ pathLength: 0 }}
				animate={{ pathLength: 1 }}
				transition={{ duration: 2 }}
			>
				<svg
					className="absolute w-full h-full"
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
				>
					<motion.path
						d="M0,50 Q25,40 50,50 T100,50"
						stroke="currentColor"
						strokeWidth="0.5"
						fill="none"
						className="text-violet-500/20"
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 2, delay: 0.5 }}
					/>
				</svg>
			</motion.div>

			<motion.h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500">
				<motion.span>{rounded}</motion.span>
				<span className="text-lg align-top">+</span>
			</motion.h3>

			<p className="text-zinc-600 dark:text-zinc-400 mt-2">{label}</p>

			<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
		</Glass>
	);
};
