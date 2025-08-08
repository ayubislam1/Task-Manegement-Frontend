import { useEffect, useRef } from "react";

type FocusableElement = HTMLAnchorElement | HTMLButtonElement;

export function useKeyboardFocus(isOpen: boolean) {
	const containerRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		const container = containerRef.current;
		if (!container) return;

		const focusableElements = container.querySelectorAll<FocusableElement>(
			"a[href], button:not([disabled])"
		);

		if (!focusableElements.length) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Tab") {
				if (e.shiftKey) {
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}

			// Close on Escape
			if (e.key === "Escape") {
				container.dispatchEvent(new CustomEvent("closeSidebar"));
			}
		};

		container.addEventListener("keydown", handleKeyDown);
		return () => container.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	return containerRef;
}
