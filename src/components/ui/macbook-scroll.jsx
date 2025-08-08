import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const MacbookScroll = ({ title, src, showGradient }) => {
	const ref = React.useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"],
	});

	const [isMobile, setIsMobile] = React.useState(false);

	React.useEffect(() => {
		if (window && window.innerWidth < 768) {
			setIsMobile(true);
		}
	}, []);

	const scale = useTransform(scrollYProgress, [0, 1], [1, 0.7]);
	const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);
	const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

	return (
		<div
			ref={ref}
			className="min-h-[180vh] w-full flex flex-col items-center justify-start pt-20 px-4"
		>
			<motion.div
				style={{
					scale,
					translate: translate,
					opacity,
				}}
				className="max-w-7xl mx-auto"
			>
				{title}
			</motion.div>

			<motion.div
				style={{
					scale,
					translate: translate,
					opacity,
				}}
				className="relative w-full max-w-5xl mx-auto h-full mt-20"
			>
				<div className="bg-zinc-900 rounded-t-2xl p-2">
					<img
						src={src}
						alt="Dashboard Preview"
						className="rounded-lg w-full"
					/>
				</div>
				{showGradient && (
					<div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B0B0F] to-transparent" />
				)}
			</motion.div>
		</div>
	);
};
