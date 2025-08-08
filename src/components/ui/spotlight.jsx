"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Spotlight = ({ className, fill = "white" }) => {
	const divRef = useRef(null);
	const mouseMoveRef = useRef(null);

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (!divRef.current) return;

			const { clientX, clientY } = e;
			const { left, top, width, height } =
				divRef.current.getBoundingClientRect();
			const x = clientX - left;
			const y = clientY - top;

			divRef.current.style.setProperty("--mouse-x", `${x}px`);
			divRef.current.style.setProperty("--mouse-y", `${y}px`);
		};

		mouseMoveRef.current = handleMouseMove;
		window.addEventListener("mousemove", mouseMoveRef.current);

		return () => {
			if (mouseMoveRef.current) {
				window.removeEventListener("mousemove", mouseMoveRef.current);
			}
		};
	}, []);

	return (
		<div
			ref={divRef}
			className={cn("relative overflow-hidden rounded-md", className)}
		>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="pointer-events-none absolute inset-0 z-30 h-full w-full transition-opacity duration-500"
				style={{
					background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), ${fill}10 0%, transparent 40%)`,
				}}
			/>
		</div>
	);
};
