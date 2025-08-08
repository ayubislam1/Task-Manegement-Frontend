import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sun, Moon, LogOut, Users, Bell, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "../context/DashboardContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = ({ theme, setTheme }) => {
	const { user, logOut } = useAuth();
	const location = useLocation();
	const { dashboards, activeDashboard } = useDashboard();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const navLinks = [
		{ title: "Dashboard", path: "/dashboard" },
		{ title: "Tasks", path: "/dashboard/tasks" },
		{ title: "Team", path: "/team" },
	];

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					<div className="flex items-center">
						<Link
							to="/"
							className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500 mr-8"
						>
							TaskBoard
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden md:flex space-x-4">
							{navLinks.map((link) => (
								<Link
									key={link.path}
									to={link.path}
									className={`px-3 py-2 rounded-md text-sm font-medium ${
										location.pathname === link.path ||
										location.pathname.startsWith(link.path + "/")
											? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
											: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
									}`}
								>
									{link.title}
								</Link>
							))}
						</div>
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<button
							onClick={toggleMobileMenu}
							className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							{isMobileMenuOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>
					</div>

					<div className="hidden md:flex items-center gap-4">
						{/* Dashboard Name (if active) */}
						{activeDashboard && (
							<div className="px-3 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium border border-indigo-200 dark:border-indigo-800">
								{activeDashboard.name}
							</div>
						)}

						{/* Theme Toggle */}
						<button
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
							className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
							aria-label="Toggle theme"
						>
							{theme === "dark" ? (
								<Sun className="w-5 h-5" />
							) : (
								<Moon className="w-5 h-5" />
							)}
						</button>

						{/* Notifications */}
						<button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
							<Bell className="w-5 h-5" />
							<span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500"></span>
						</button>

						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={
													user.photoURL ||
													`https://ui-avatars.com/api/?name=${user.displayName}`
												}
												alt={user.displayName}
											/>
											<AvatarFallback>
												{user.displayName
													? user.displayName.charAt(0).toUpperCase()
													: "U"}
											</AvatarFallback>
										</Avatar>
										<span className="text-sm font-medium hidden lg:block">
											{user.displayName || user.email}
										</span>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel>My Account</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link to="/dashboard" className="cursor-pointer">
											Dashboard
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/team" className="cursor-pointer">
											<Users className="mr-2 h-4 w-4" />
											<span>Team Management</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={logOut}
										className="text-red-500 cursor-pointer"
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Log out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Link
								to="/login"
								className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
							>
								Login
							</Link>
						)}
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{isMobileMenuOpen && (
				<div className="md:hidden bg-white dark:bg-gray-900 px-2 pt-2 pb-3 space-y-1 sm:px-3 border-b border-gray-200 dark:border-gray-800">
					{navLinks.map((link) => (
						<Link
							key={link.path}
							to={link.path}
							onClick={() => setIsMobileMenuOpen(false)}
							className={`block px-3 py-2 rounded-md text-base font-medium ${
								location.pathname === link.path
									? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
									: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
							}`}
						>
							{link.title}
						</Link>
					))}
					<div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
						<div className="flex items-center px-5">
							<div className="flex-shrink-0">
								<Avatar className="h-10 w-10">
									<AvatarImage
										src={
											user?.photoURL ||
											`https://ui-avatars.com/api/?name=${
												user?.displayName || "U"
											}`
										}
										alt={user?.displayName || "User"}
									/>
									<AvatarFallback>
										{user?.displayName
											? user.displayName.charAt(0).toUpperCase()
											: "U"}
									</AvatarFallback>
								</Avatar>
							</div>
							<div className="ml-3">
								<div className="text-base font-medium text-gray-800 dark:text-gray-200">
									{user?.displayName || user?.email || "User"}
								</div>
								<div className="text-sm font-medium text-gray-500 dark:text-gray-400">
									{user?.email}
								</div>
							</div>
							<button
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
								className="ml-auto p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
							>
								{theme === "dark" ? (
									<Sun className="w-5 h-5" />
								) : (
									<Moon className="w-5 h-5" />
								)}
							</button>
						</div>
						<div className="mt-3 px-2 space-y-1">
							<button
								onClick={logOut}
								className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
							>
								<div className="flex items-center">
									<LogOut className="mr-2 h-5 w-5" />
									<span>Log out</span>
								</div>
							</button>
						</div>
					</div>
				</div>
			)}
		</motion.nav>
	);
};

export default Navbar;
