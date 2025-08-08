import { Sun, Moon, Laptop } from "lucide-react";
import { motion } from "framer-motion";

const ThemeToggle = ({ theme, setTheme }) => {
	return (
		<motion.button
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="fixed top-4 right-4 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 z-50"
		>
			<motion.div
				initial={{ rotate: 0 }}
				animate={{ rotate: theme === "dark" ? 360 : 0 }}
				transition={{ duration: 0.5 }}
			>
				{theme === "dark" ? (
					<Sun className="w-5 h-5 text-yellow-500" />
				) : (
					<Moon className="w-5 h-5 text-gray-700" />
				)}
			</motion.div>
		</motion.button>
	);
};

export default ThemeToggle;
