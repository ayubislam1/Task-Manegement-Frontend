import React, { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "./mode-toggle";

const Navbar = ({ onMenuClick }) => {
	const { user, logOut } = useAuth();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<header className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-gray-950/90 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md shadow-sm">
			<div className="flex h-16 items-center px-4">
				<button
					className="mr-4 p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 md:hidden rounded-full transition-colors"
					onClick={onMenuClick}
					aria-label="Toggle menu"
				>
					<Menu className="h-6 w-6" />
				</button>

				<div className="md:hidden font-bold tracking-wide text-indigo-700 dark:text-indigo-400">
					TASK MASTER
				</div>

				<div className="flex-1 flex items-center justify-end space-x-4">
					<div className="relative flex items-center">
						<input
							type="text"
							placeholder="Search tasks..."
							className="rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-40 md:w-64 transition-colors"
						/>
					</div>

					<ThemeToggle />

					<button
						className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 relative rounded-full transition-colors"
						aria-label="Notifications"
					>
						<Bell className="h-5 w-5" />
						<span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
					</button>

					<div className="relative">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="flex items-center focus:outline-none"
						>
							<div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center text-white font-semibold shadow-md">
								{user?.displayName?.[0] || "U"}
							</div>
						</button>

						{isOpen && (
							<div className="absolute right-0 mt-2 w-52 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl py-1 z-50 transition-all">
								<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
									<p className="text-sm font-semibold text-gray-900 dark:text-white">
										{user?.displayName}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{user?.email}
									</p>
								</div>
								<button
									onClick={() => logOut()}
									className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-gray-400 dark:hover:bg-gray-800 rounded-b-lg transition-colors"
								>
									Sign out
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
