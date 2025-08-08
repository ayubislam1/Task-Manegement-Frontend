import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { format, differenceInDays } from "date-fns";
import { useTask } from "./useTask";

export const useTaskReminders = () => {
	const { tasks } = useTask();
	const [notifiedTaskIds, setNotifiedTaskIds] = useState(() => {
		// Try to get previously notified tasks from localStorage
		const saved = localStorage.getItem("notifiedOverdueTasks");
		return saved ? JSON.parse(saved) : {};
	});

	useEffect(() => {
		// Check for overdue tasks
		const checkOverdueTasks = () => {
			const now = new Date();
			const currentTime = now.getTime();

			// Group overdue tasks by priority to display better notifications
			const overdueTasks = {
				high: [],
				medium: [],
				low: [],
				noPriority: [],
			};

			// Track newly notified tasks in this session
			const newlyNotified = {};

			tasks.forEach((task) => {
				if (task.category !== "Done" && task.dueDate) {
					const dueDate = new Date(task.dueDate);

					if (!isNaN(dueDate.getTime()) && dueDate < now) {
						// Check if we've already notified for this task recently
						const lastNotified = notifiedTaskIds[task._id] || 0;
						const daysSinceLastNotified = differenceInDays(
							currentTime,
							lastNotified
						);

						// Only notify if we haven't notified today (or at all)
						if (daysSinceLastNotified >= 1) {
							// Categorize by priority
							const priority = task.priority
								? task.priority.toLowerCase()
								: "noPriority";

							if (priority === "high") {
								overdueTasks.high.push(task);
							} else if (priority === "medium") {
								overdueTasks.medium.push(task);
							} else if (priority === "low") {
								overdueTasks.low.push(task);
							} else {
								overdueTasks.noPriority.push(task);
							}

							// Mark this task as notified now
							newlyNotified[task._id] = currentTime;
						}
					}
				}
			});

			// Show grouped notifications by priority
			if (overdueTasks.high.length > 0) {
				const taskNames = overdueTasks.high.map((t) => t.title).join(", ");
				toast.error(
					<div
						onClick={() => (window.location.href = "/dashboard")}
						className="cursor-pointer"
					>
						<p className="font-bold">⚠️ High Priority Overdue Tasks!</p>
						<p>
							{overdueTasks.high.length === 1
								? `"${taskNames}" is overdue`
								: `${overdueTasks.high.length} tasks are overdue: ${taskNames}`}
						</p>
						<p className="text-xs mt-1">Click to view on dashboard</p>
					</div>,
					{ duration: 7000, id: "high-priority-overdue" }
				);
			}

			if (overdueTasks.medium.length > 0) {
				toast(
					<div
						onClick={() => (window.location.href = "/dashboard")}
						className="cursor-pointer"
					>
						<p className="font-bold">📅 Medium Priority Tasks Overdue</p>
						<p>{overdueTasks.medium.length} tasks need your attention</p>
					</div>,
					{ duration: 5000, id: "medium-priority-overdue" }
				);
			}

			if (overdueTasks.low.length + overdueTasks.noPriority.length > 0) {
				const totalCount =
					overdueTasks.low.length + overdueTasks.noPriority.length;
				toast(
					`You have ${totalCount} overdue task${
						totalCount > 1 ? "s" : ""
					} with low/no priority`,
					{ duration: 4000, id: "low-priority-overdue" }
				);
			}

			// Update the notified tasks state with the new notifications
			if (Object.keys(newlyNotified).length > 0) {
				setNotifiedTaskIds((prev) => {
					const updated = { ...prev, ...newlyNotified };
					// Save to localStorage
					localStorage.setItem("notifiedOverdueTasks", JSON.stringify(updated));
					return updated;
				});
			}
		};

		// Initial check with a small delay to avoid showing too many notifications at startup
		const initialCheckTimeout = setTimeout(checkOverdueTasks, 3000);

		// Set up periodic checks
		const interval = setInterval(checkOverdueTasks, 30 * 60 * 1000); // Check every 30 minutes

		return () => {
			clearTimeout(initialCheckTimeout);
			clearInterval(interval);
		};
	}, [tasks, notifiedTaskIds]);

	return null;
};
