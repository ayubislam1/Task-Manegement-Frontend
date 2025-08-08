import { useEffect } from "react";

export const useDragGesture = (ref, onDragStart) => {
	useEffect(() => {
		if (!ref.current) return;

		let startX = 0;
		let startY = 0;
		let isDragging = false;

		const handleTouchStart = (e) => {
			const touch = e.touches[0];
			startX = touch.clientX;
			startY = touch.clientY;
			isDragging = true;
		};

		const handleTouchMove = (e) => {
			if (!isDragging) return;

			const touch = e.touches[0];
			const deltaX = touch.clientX - startX;
			const deltaY = touch.clientY - startY;

			// If movement is significant enough, trigger drag start
			if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
				onDragStart?.();
			}
		};

		const handleTouchEnd = () => {
			isDragging = false;
		};

		const element = ref.current;
		element.addEventListener("touchstart", handleTouchStart);
		element.addEventListener("touchmove", handleTouchMove);
		element.addEventListener("touchend", handleTouchEnd);

		return () => {
			element.removeEventListener("touchstart", handleTouchStart);
			element.removeEventListener("touchmove", handleTouchMove);
			element.removeEventListener("touchend", handleTouchEnd);
		};
	}, [ref, onDragStart]);
};
