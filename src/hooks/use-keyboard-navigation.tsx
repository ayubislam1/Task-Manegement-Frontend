import { useEffect, useRef } from "react";

type NavigableElement = HTMLButtonElement | HTMLAnchorElement;

interface UseKeyboardNavigationProps {
	selector: string;
	onEscape?: () => void;
}

export function useKeyboardNavigation({
	selector,
	onEscape,
}: UseKeyboardNavigationProps) {
	const containerRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const elements = Array.from(
			container.querySelectorAll<NavigableElement>(selector)
		);

		if (!elements.length) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target as NavigableElement;
			const currentIndex = elements.indexOf(target);

			switch (event.key) {
				case "ArrowDown":
				case "ArrowRight":
					event.preventDefault();
					const nextIndex = (currentIndex + 1) % elements.length;
					elements[nextIndex].focus();
					break;

				case "ArrowUp":
				case "ArrowLeft":
					event.preventDefault();
					const prevIndex =
						(currentIndex - 1 + elements.length) % elements.length;
					elements[prevIndex].focus();
					break;

				case "Home":
					event.preventDefault();
					elements[0].focus();
					break;

				case "End":
					event.preventDefault();
					elements[elements.length - 1].focus();
					break;

				case "Escape":
					if (onEscape) {
						event.preventDefault();
						onEscape();
					}
					break;
			}
		};

		elements.forEach((element) => {
			element.addEventListener("keydown", handleKeyDown);
		});

		return () => {
			elements.forEach((element) => {
				element.removeEventListener("keydown", handleKeyDown);
			});
		};
	}, [selector, onEscape]);

	return containerRef;
}
