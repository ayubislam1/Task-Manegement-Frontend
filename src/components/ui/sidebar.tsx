import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	LayoutDashboard,
	CheckSquare,
	ListTodo,
	Clock,
	Users,
	LogOut,
	ChevronLeft,
	Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
	const location = useLocation();
	const { logOut, user } = useAuth();
	const [collapsed, setCollapsed] = useState(false);

	const handleLogout = async () => {
		try {
			await logOut();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const menuItems = [
		{
			title: "Dashboard",
			icon: <LayoutDashboard className="h-5 w-5" />,
			path: "/dashboard",
		},
		{
			title: "Task Board",
			icon: <CheckSquare className="h-5 w-5" />,
			path: "/dashboard/tasks",
		},
		{
			title: "To-Do",
			icon: <ListTodo className="h-5 w-5" />,
			path: "/dashboard/to-do",
		},
		{
			title: "In Progress",
			icon: <Clock className="h-5 w-5" />,
			path: "/dashboard/in-progress",
		},
		{
			title: "Complete",
			icon: <CheckSquare className="h-5 w-5" />,
			path: "/dashboard/complete",
		},
		{
			title: "Calendar",
			icon: <Calendar className="h-5 w-5" />,
			path: "/dashboard/calendar",
		},
	];

	return (
		<>
			<div
				className={cn(
					"fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden",
					isOpen ? "block" : "hidden"
				)}
				onClick={onClose}
			/>
			<aside
				className={cn(
					"fixed top-0 left-0 z-40 h-full border-r bg-white text-gray-900 dark:bg-gray-950 dark:text-white shadow-md transition-all duration-300 ease-in-out",
					collapsed ? "w-20" : "w-64",
					isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
				)}
			>
				<div className="flex h-full flex-col">
					<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
						{!collapsed && (
							<div className="flex items-center gap-2">
								<div className="bg-indigo-600 p-2 rounded-full mr-2">
									<span className="text-white font-bold">TM</span>
								</div>
								<span className="font-bold tracking-wide">TASK MASTER</span>
							</div>
						)}
						<button
							onClick={() => setCollapsed(!collapsed)}
							className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-white"
							aria-label="Collapse sidebar"
						>
							<ChevronLeft
								className={cn(
									"h-5 w-5 transition-transform",
									collapsed && "rotate-180"
								)}
							/>
						</button>
					</div>

					<div className="flex-1 overflow-y-auto">
						<nav className="space-y-1 p-2" aria-label="Main navigation">
							{menuItems.map((item) => (
								<Link
									key={item.path}
									to={item.path}
									className={cn(
										"flex items-center px-3 py-2 rounded-md text-sm transition-all",
										location.pathname === item.path
											? "bg-indigo-100 text-indigo-700 dark:bg-indigo-600/30 dark:text-indigo-400"
											: "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
										collapsed && "justify-center px-2"
									)}
									onClick={onClose}
								>
									<span
										className={cn(
											"mr-3",
											location.pathname === item.path
												? "text-indigo-500 dark:text-indigo-400"
												: "text-gray-400"
										)}
									>
										{item.icon}
									</span>
									{!collapsed && <span>{item.title}</span>}
								</Link>
							))}
						</nav>
					</div>

					<div className="mt-auto border-t border-gray-200 dark:border-gray-800 p-4">
						{!collapsed && user && (
							<div className="flex items-center gap-3 mb-2">
								<div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center">
									<span className="text-sm font-medium text-white">
										{user.displayName?.[0] || "U"}
									</span>
								</div>
								<div>
									<div className="text-sm font-medium text-gray-900 dark:text-white">
										{user.displayName}
									</div>
									<div className="text-xs text-gray-500 dark:text-gray-400">
										{user.email}
									</div>
								</div>
							</div>
						)}
						<button
							onClick={handleLogout}
							className={cn(
								"flex items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-gray-400 dark:hover:bg-gray-800 w-full",
								collapsed && "justify-center px-2"
							)}
						>
							<LogOut className="h-5 w-5" />
							{!collapsed && <span className="ml-3">Logout</span>}
						</button>
					</div>
				</div>
			</aside>
		</>
	);
}

export default Sidebar;
