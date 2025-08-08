import { useEffect, useRef } from "react";

interface TouchGestureOptions {
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
	threshold?: number;
	disabled?: boolean;
}

export function useTouchGesture({
	onSwipeLeft,
	onSwipeRight,
	threshold = 50,
	disabled = false,
}: TouchGestureOptions) {
	const touchStartRef = useRef<number>(0);
	const touchEndRef = useRef<number>(0);
	const elementRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (disabled) return;

		const element = elementRef.current;
		if (!element) return;

		const handleTouchStart = (e: TouchEvent) => {
			touchStartRef.current = e.touches[0].clientX;
		};

		const handleTouchMove = (e: TouchEvent) => {
			touchEndRef.current = e.touches[0].clientX;
		};

		const handleTouchEnd = () => {
			const swipeDistance = touchStartRef.current - touchEndRef.current;
			const isLeftSwipe = swipeDistance > threshold;
			const isRightSwipe = swipeDistance < -threshold;

			if (isLeftSwipe && onSwipeLeft) {
				onSwipeLeft();
			}

			if (isRightSwipe && onSwipeRight) {
				onSwipeRight();
			}

			// Reset values
			touchStartRef.current = 0;
			touchEndRef.current = 0;
		};

		element.addEventListener("touchstart", handleTouchStart);
		element.addEventListener("touchmove", handleTouchMove);
		element.addEventListener("touchend", handleTouchEnd);

		return () => {
			element.removeEventListener("touchstart", handleTouchStart);
			element.removeEventListener("touchmove", handleTouchMove);
			element.removeEventListener("touchend", handleTouchEnd);
		};
	}, [onSwipeLeft, onSwipeRight, threshold, disabled]);

	return elementRef;
}
