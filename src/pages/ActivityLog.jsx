import React, { useState, useEffect } from "react";
import { useTaskContext } from "../context/TaskContext";
import { socket } from "../socket/socket";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock, RefreshCcw } from "lucide-react";

const ActivityLog = () => {
	const [activities, setActivities] = useState([]);
	const { tasks } = useTaskContext();
	const { user } = useAuth();

	// Handle real-time socket events
	useEffect(() => {
		if (!socket) return;

		const handleNewActivity = (activity) => {
			setActivities((prev) =>
				[
					{
						id: Date.now(),
						...activity,
						timestamp: new Date().toISOString(),
					},
					...prev,
				].slice(0, 50)
			); // Keep last 50 activities
		};

		socket.on("new_task", (task) => {
			handleNewActivity({
				message: `Task "${task.title}" created by ${
					task.createdBy?.name || "another user"
				}`,
				type: "create",
			});
		});

		socket.on("task_deleted", (taskId) => {
			const deletedTask = tasks.find((t) => t._id === taskId);
			handleNewActivity({
				message: `Task "${deletedTask?.title || "Unknown"}" deleted`,
				type: "delete",
			});
		});

		socket.on("task_updated", ({ taskId, updates }) => {
			const task = tasks.find((t) => t._id === taskId);
			if (task) {
				if (updates.category) {
					const newCategory =
						updates.category === "todo"
							? "To-Do"
							: updates.category === "inProgress"
							? "In Progress"
							: "Done";
					handleNewActivity({
						message: `Task "${task.title}" moved to ${newCategory}`,
						type: "move",
					});
				} else {
					handleNewActivity({
						message: `Task "${task.title}" updated`,
						type: "update",
					});
				}
			}
		});

		return () => {
			socket.off("new_task");
			socket.off("task_deleted");
			socket.off("task_updated");
		};
	}, [tasks]);

	// Generate initial activities from tasks
	useEffect(() => {
		const generateInitialActivities = () => {
			const allActivities = tasks
				.map((task) => {
					const activities = [];

					// Creation activity
					activities.push({
						id: `${task._id}-created`,
						message: `Task "${task.title}" created in ${task.category}`,
						timestamp: task.createdAt,
						type: "create",
					});

					// Update activity if task was updated
					if (task.updatedAt && task.updatedAt !== task.createdAt) {
						activities.push({
							id: `${task._id}-updated`,
							message: `Task "${task.title}" updated`,
							timestamp: task.updatedAt,
							type: "update",
						});
					}

					return activities;
				})
				.flat();

			// Sort by timestamp descending and take latest 50
			const sortedActivities = allActivities
				.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
				.slice(0, 50);

			setActivities(sortedActivities);
		};

		generateInitialActivities();
	}, []);

	const getActivityIcon = (type) => {
		switch (type) {
			case "create":
				return (
					<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
						<Activity
							size={16}
							className="text-green-600 dark:text-green-400"
						/>
					</div>
				);
			case "delete":
				return (
					<div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
						<Activity size={16} className="text-red-600 dark:text-red-400" />
					</div>
				);
			case "move":
				return (
					<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
						<RefreshCcw
							size={16}
							className="text-blue-600 dark:text-blue-400"
						/>
					</div>
				);
			default:
				return (
					<div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded-full">
						<Activity size={16} className="text-gray-600 dark:text-gray-400" />
					</div>
				);
		}
	};

	const formatTimestamp = (timestamp) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now - date;

		// Less than 1 minute
		if (diff < 60000) {
			return "Just now";
		}
		// Less than 1 hour
		if (diff < 3600000) {
			const minutes = Math.floor(diff / 60000);
			return `${minutes}m ago`;
		}
		// Less than 24 hours
		if (diff < 86400000) {
			const hours = Math.floor(diff / 3600000);
			return `${hours}h ago`;
		}
		// Otherwise show date
		return date.toLocaleDateString();
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
					<Activity className="mr-2" />
					Activity Log
				</h2>
				<span className="text-sm text-gray-500 dark:text-gray-400">
					{activities.length} activities
				</span>
			</div>

			<div className="space-y-4">
				<AnimatePresence>
					{activities.length > 0 ? (
						activities.map((activity) => (
							<motion.div
								key={activity.id}
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 20 }}
								className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
							>
								{getActivityIcon(activity.type)}
								<div className="flex-1 min-w-0">
									<p className="text-gray-900 dark:text-white text-sm">
										{activity.message}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
										<Clock size={12} className="mr-1" />
										{formatTimestamp(activity.timestamp)}
									</p>
								</div>
							</motion.div>
						))
					) : (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-center text-gray-500 dark:text-gray-400 py-8"
						>
							No activities yet
						</motion.p>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default ActivityLog;
