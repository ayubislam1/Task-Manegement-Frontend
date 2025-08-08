import React from "react";
import { motion } from "framer-motion";

export const SpotlightNew = ({
	gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(258, 100%, 85%, .08) 0, hsla(258, 100%, 55%, .02) 50%, hsla(258, 100%, 45%, 0) 80%)",
	gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(258, 100%, 85%, .06) 0, hsla(258, 100%, 55%, .02) 80%, transparent 100%)",
	gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(258, 100%, 85%, .04) 0, hsla(258, 100%, 45%, .02) 80%, transparent 100%)",
	translateY = -350,
	width = 560,
	height = 1380,
	smallWidth = 240,
	duration = 7,
	xOffset = 100,
	className = "",
	isDark = false,
}) => {
	// Adjust gradients for light mode
	const lightModeGradients = {
		first:
			"radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(258, 100%, 85%, .15) 0, hsla(258, 100%, 55%, .08) 50%, hsla(258, 100%, 45%, 0) 80%)",
		second:
			"radial-gradient(50% 50% at 50% 50%, hsla(258, 100%, 85%, .12) 0, hsla(258, 100%, 55%, .08) 80%, transparent 100%)",
		third:
			"radial-gradient(50% 50% at 50% 50%, hsla(258, 100%, 85%, .1) 0, hsla(258, 100%, 45%, .08) 80%, transparent 100%)",
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 1.5 }}
			className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
		>
			<motion.div
				animate={{ x: [0, xOffset, 0] }}
				transition={{
					duration,
					repeat: Infinity,
					repeatType: "reverse",
					ease: "easeInOut",
				}}
				className="absolute top-0 left-0 w-screen h-screen z-40 pointer-events-none"
			>
				<div
					style={{
						transform: `translateY(${translateY}px) rotate(-45deg)`,
						background: isDark ? gradientFirst : lightModeGradients.first,
						width: `${width}px`,
						height: `${height}px`,
					}}
					className="absolute top-0 left-0"
				/>
			</motion.div>

			<motion.div
				animate={{ x: [0, -xOffset, 0] }}
				transition={{
					duration: duration * 1.2,
					repeat: Infinity,
					repeatType: "reverse",
					ease: "easeInOut",
				}}
				className="absolute top-40 right-0 w-screen h-screen z-40 pointer-events-none"
			>
				<div
					style={{
						transform: `translateY(${translateY * 0.8}px) rotate(45deg)`,
						background: isDark ? gradientSecond : lightModeGradients.second,
						width: `${smallWidth}px`,
						height: `${height * 0.8}px`,
					}}
					className="absolute top-0 right-0"
				/>
			</motion.div>

			<motion.div
				animate={{ x: [0, xOffset * 0.7, 0] }}
				transition={{
					duration: duration * 0.8,
					repeat: Infinity,
					repeatType: "reverse",
					ease: "easeInOut",
				}}
				className="absolute bottom-0 left-1/2 w-screen h-screen z-40 pointer-events-none"
			>
				<div
					style={{
						transform: `translateY(${translateY * 1.2}px) rotate(-45deg)`,
						background: isDark ? gradientThird : lightModeGradients.third,
						width: `${width * 0.8}px`,
						height: `${height * 0.6}px`,
					}}
					className="absolute bottom-0 left-0"
				/>
			</motion.div>
		</motion.div>
	);
};
