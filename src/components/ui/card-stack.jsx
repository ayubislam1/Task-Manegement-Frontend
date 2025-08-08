"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const CARD_OFFSET = 10;
const SCALE_FACTOR = 0.06;

export const CardStack = ({ items }) => {
	const [cards] = useState(items);
	const [dragging, setDragging] = useState(false);

	return (
		<div className="relative h-[400px] w-full max-w-lg mx-auto">
			{cards.map((card, index) => {
				return (
					<motion.div
						key={card.id}
						className="absolute w-full bg-white dark:bg-black h-[300px] rounded-3xl p-8 shadow-xl border border-neutral-200 dark:border-white/[0.1] shadow-black/[0.1] dark:shadow-white/[0.05] flex flex-col justify-between"
						style={{
							transformOrigin: "top center",
							cursor: dragging ? "grabbing" : "grab",
						}}
						animate={{
							top: index * -CARD_OFFSET,
							scale: 1 - index * SCALE_FACTOR,
							zIndex: cards.length - index,
						}}
						drag="y"
						dragConstraints={{
							top: 0,
							bottom: 0,
						}}
						onDragStart={() => setDragging(true)}
						onDragEnd={() => setDragging(false)}
						dragElastic={0.3}
						dragTransition={{
							bounceStiffness: 200,
							bounceDamping: 10,
						}}
					>
						<div className="h-full overflow-hidden">{card.content}</div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: index * 0.2 }}
							className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent dark:from-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
						/>
						<motion.div
							className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] to-transparent dark:from-violet-500/[0.05] blur-xl"
							style={{
								clipPath: "inset(0)",
								transform: "translateZ(0)",
							}}
						/>
					</motion.div>
				);
			})}
		</div>
	);
};
