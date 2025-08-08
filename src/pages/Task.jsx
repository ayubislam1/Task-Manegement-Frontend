import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	Edit,
	Trash2,
	Clock,
	Info,
	User,
	Timer,
	Play,
	Pause,
	Link,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useTaskContext } from "../context/TaskContext";

const Task = ({ task, onDelete, onEdit, allTasks }) => {
	const [showDetails, setShowDetails] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isDragStarted, setIsDragStarted] = useState(false);
	const [isTracking, setIsTracking] = useState(false);
	const [timeSpent, setTimeSpent] = useState(task.timeSpent || 0);
	const [timer, setTimer] = useState(null);
	const [showDependencies, setShowDependencies] = useState(false);
	const { isTransitioning, setIsTransitioning, updateTask } = useTaskContext();

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition: dndTransition,
		isDragging,
	} = useSortable({
		id: task._id,
		data: {
			type: "task",
			task,
		},
		disabled: isLoading,
	});

	// Improved drag start animation with cleanup
	useEffect(() => {
		let timer;
		if (isDragging && !isDragStarted) {
			setIsDragStarted(true);
			setIsTransitioning(true);
		} else if (!isDragging && isDragStarted) {
			timer = setTimeout(() => {
				setIsDragStarted(false);
				setIsTransitioning(false);
			}, 300);
		}
		return () => timer && clearTimeout(timer);
	}, [isDragging, isDragStarted, setIsTransitioning]);

	const style = {
		transform: CSS.Transform.toString(transform),
		transition: isDragStarted
			? dndTransition
			: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
		opacity: isDragging ? 0.6 : 1,
		cursor: isDragging ? "grabbing" : isLoading ? "wait" : "grab",
		zIndex: isDragging ? 999 : "auto",
		position: "relative", // Explicitly set position to relative
		touchAction: "none",
		width: isDragging ? "calc(100% - 2rem)" : "auto",
	};

	// Simplified handlers that directly call the parent functions
	const handleEdit = (e) => {
		e.stopPropagation();
		if (isLoading) return;
		onEdit(task);
	};

	const handleDelete = (e) => {
		e.stopPropagation();
		if (isLoading) return;
		onDelete(task._id);
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) return "Invalid date";
			return format(date, "MMM d, yyyy");
		} catch (error) {
			console.error("Date formatting error:", error);
			return "Invalid date";
		}
	};

	const isPastDue = () => {
		if (!task.dueDate) return false;
		try {
			const dueDate = new Date(task.dueDate);
			return !isNaN(dueDate.getTime()) && dueDate < new Date();
		} catch {
			return false;
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority?.toLowerCase()) {
			case "high":
				return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
			case "medium":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
			case "low":
				return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
		}
	};

	const assignedUsers =
		task.assignedTo && Array.isArray(task.assignedTo) ? task.assignedTo : [];

	// Handle time tracking
	const toggleTimeTracking = (e) => {
		e.stopPropagation();
		if (isTracking) {
			// Stop tracking
			clearInterval(timer);
			setTimer(null);
			setIsTracking(false);

			// Save the updated time spent
			updateTask(task._id, { ...task, timeSpent });
			toast.success(`Time tracking stopped for "${task.title}"`);
		} else {
			// Start tracking
			const intervalId = setInterval(() => {
				setTimeSpent((prev) => prev + 1);
			}, 1000);
			setTimer(intervalId);
			setIsTracking(true);
			toast.success(`Time tracking started for "${task.title}"`);
		}
	};

	// Format seconds into hours, minutes, seconds
	const formatTime = (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		return `${hours > 0 ? hours + "h " : ""}${minutes}m ${secs}s`;
	};

	// Clean up timer on unmount
	useEffect(() => {
		return () => {
			if (timer) {
				clearInterval(timer);
			}
		};
	}, [timer]);

	// Get dependent tasks
	const dependentTasks = task.dependencies
		? allTasks.filter((t) => task.dependencies.includes(t._id))
		: [];

	// Check if task is blocked by dependencies
	const isBlocked = () => {
		if (!task.dependencies || task.dependencies.length === 0) return false;

		return task.dependencies.some((depId) => {
			const depTask = allTasks.find((t) => t._id === depId);
			return depTask && depTask.category !== "Done";
		});
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={`
        p-4 mb-3 rounded-lg border shadow-sm transition-all duration-200
        ${
					task.category === "To-Do"
						? "bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30"
						: task.category === "In Progress"
						? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30"
						: "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30"
				}
        ${
					isBlocked()
						? "border-l-4 border-l-orange-500 dark:border-l-orange-600"
						: ""
				}
        ${
					isDragging
						? "shadow-lg ring-2 ring-indigo-500/50 cursor-grabbing z-50 scale-[1.02]"
						: isDragStarted
						? "transform-none"
						: "hover:shadow-md hover:scale-[1.01] transition-transform"
				}
        ${isLoading ? "opacity-50 pointer-events-none" : ""}
      `}
		>
			<div className="flex justify-between items-start gap-2">
				<h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
					{task.title}
				</h3>
				<div className="flex gap-1 shrink-0">
					<button
						onClick={handleEdit}
						disabled={isLoading}
						className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Edit size={14} />
					</button>
					<button
						onClick={handleDelete}
						disabled={isLoading}
						className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Trash2 size={14} />
					</button>
				</div>
			</div>

			<div className="mt-3 flex flex-wrap gap-2 items-center">
				{isBlocked() && (
					<Badge
						className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
						variant="outline"
					>
						Blocked
					</Badge>
				)}

				{task.priority && (
					<Badge className={getPriorityColor(task.priority)} variant="outline">
						{task.priority}
					</Badge>
				)}

				{task.dueDate && (
					<div
						className={`
              flex items-center text-xs px-2 py-1 rounded-full
              ${
								isPastDue()
									? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
									: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
							}
            `}
					>
						<Clock size={12} className="mr-1" />
						{formatDate(task.dueDate)}
					</div>
				)}

				{/* Time tracking button and display */}
				<div className="flex items-center text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
					<Timer size={12} className="mr-1" />
					{formatTime(timeSpent)}
					<button
						onClick={toggleTimeTracking}
						className="ml-1 p-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800"
					>
						{isTracking ? <Pause size={10} /> : <Play size={10} />}
					</button>
				</div>

				{/* Dependencies button */}
				{(task.dependencies?.length > 0 || dependentTasks.length > 0) && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							setShowDependencies(!showDependencies);
						}}
						className="flex items-center text-xs text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
					>
						<Link size={12} className="mr-1" />
						Dependencies
					</button>
				)}

				<button
					onClick={(e) => {
						e.stopPropagation();
						setShowDetails(!showDetails);
					}}
					className="flex items-center text-xs text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 ml-auto transition-colors"
				>
					<Info size={12} className="mr-1" />
					Details
				</button>
			</div>

			{/* Show dependencies section */}
			{showDependencies && (
				<div className="mt-3 text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
					{task.dependencies?.length > 0 && (
						<>
							<h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
								Waiting on:
							</h4>
							<div className="space-y-1 mb-2">
								{task.dependencies.map((depId) => {
									const depTask = allTasks.find((t) => t._id === depId);
									return depTask ? (
										<div
											key={depId}
											className="flex items-center justify-between"
										>
											<span className="text-xs truncate">{depTask.title}</span>
											<Badge
												className={
													depTask.category === "Done"
														? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
														: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
												}
											>
												{depTask.category}
											</Badge>
										</div>
									) : null;
								})}
							</div>
						</>
					)}

					{dependentTasks.length > 0 && (
						<>
							<h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
								Blocking:
							</h4>
							<div className="space-y-1">
								{dependentTasks.map((depTask) => (
									<div
										key={depTask._id}
										className="flex items-center justify-between"
									>
										<span className="text-xs truncate">{depTask.title}</span>
										<Badge className={getPriorityColor(depTask.priority)}>
											{depTask.priority}
										</Badge>
									</div>
								))}
							</div>
						</>
					)}
				</div>
			)}

			{assignedUsers.length > 0 && (
				<div className="mt-3 flex -space-x-2">
					{assignedUsers.map((user, index) => (
						<Avatar
							key={user._id || `user-${index}-${Math.random()}`}
							className="border-2 border-white dark:border-gray-900"
						>
							<AvatarImage
								src={
									user.photoURL ||
									`https://ui-avatars.com/api/?name=${user.name}`
								}
								alt={user.name}
							/>
							<AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
						</Avatar>
					))}
				</div>
			)}

			{showDetails && task.description && (
				<div className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 p-3 rounded-md">
					{task.description}
				</div>
			)}
		</div>
	);
};

export default Task;
