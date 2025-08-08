import React from "react";
import { Card } from "./ui/card";

const TaskStats = ({ tasks = [] }) => {
	const stats = {
		total: tasks.length,
		completed: tasks.filter((task) => task.status === "completed").length,
		inProgress: tasks.filter((task) => task.status === "in-progress").length,
		todo: tasks.filter((task) => task.status === "todo").length,
		highPriority: tasks.filter((task) => task.priority === "high").length,
		overdue: tasks.filter((task) => {
			if (!task.dueDate) return false;
			return new Date(task.dueDate) < new Date() && task.status !== "completed";
		}).length,
	};

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
			<Card className="p-4 flex flex-col items-center justify-center">
				<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
					Total Tasks
				</h3>
				<p className="text-2xl font-bold">{stats.total}</p>
			</Card>

			<Card className="p-4 flex flex-col items-center justify-center">
				<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
					Completed
				</h3>
				<p className="text-2xl font-bold text-green-600">{stats.completed}</p>
			</Card>

			<Card className="p-4 flex flex-col items-center justify-center">
				<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
					In Progress
				</h3>
				<p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
			</Card>

			<Card className="p-4 flex flex-col items-center justify-center">
				<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
					To Do
				</h3>
				<p className="text-2xl font-bold text-yellow-600">{stats.todo}</p>
			</Card>

			<Card className="p-4 flex flex-col items-center justify-center">
				<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
					High Priority
				</h3>
				<p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
			</Card>

			<Card className="p-4 flex flex-col items-center justify-center">
				<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
					Overdue
				</h3>
				<p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
			</Card>
		</div>
	);
};

export default TaskStats;
