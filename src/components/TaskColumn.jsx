import React, { useEffect } from "react";
import { Plus } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import Task from "../pages/Task";

const TaskColumn = ({
	id,
	title,
	tasks,
	onAddTask,
	onDeleteTask,
	onEditTask,
	status,
	searchQuery,
	priorityFilter,
	dueDateFilter,
}) => {
	const { setNodeRef } = useDroppable({ id });

	// Get all tasks from context to pass to individual Task components
	const { tasks: allTasks, deleteTask, fetchTask } = useTaskContext();

	// Filter tasks for this column - use the passed tasks directly and filter by category
	const columnTasks = tasks || [];
	const taskIds = columnTasks.map((task) => task._id);

	// Define colors for each column
	const getColumnStyles = (columnTitle) => {
		switch (columnTitle) {
			case "To-Do":
				return {
					background: "bg-red-50 dark:bg-red-950/20",
					border: "border-red-200 dark:border-red-800",
					header: "text-red-800 dark:text-red-200",
					button: "hover:bg-red-100 dark:hover:bg-red-900/30",
				};
			case "In Progress":
				return {
					background: "bg-blue-50 dark:bg-blue-950/20",
					border: "border-blue-200 dark:border-blue-800",
					header: "text-blue-800 dark:text-blue-200",
					button: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
				};
			case "Done":
				return {
					background: "bg-green-50 dark:bg-green-950/20",
					border: "border-green-200 dark:border-green-800",
					header: "text-green-800 dark:text-green-200",
					button: "hover:bg-green-100 dark:hover:bg-green-900/30",
				};
			default:
				return {
					background: "bg-gray-50 dark:bg-gray-900",
					border: "border-gray-200 dark:border-gray-800",
					header: "text-gray-800 dark:text-gray-200",
					button: "hover:bg-gray-100 dark:hover:bg-gray-800",
				};
		}
	};

	const styles = getColumnStyles(title);

	const handleDeleteTask = async (taskId) => {
		try {
			await deleteTask(taskId);
		} catch (error) {
			console.error(`Error deleting task ${taskId}:`, error);
		}
	};

	const handleEditTask = async (taskId) => {
		try {
			await fetchTask(taskId);
		} catch (error) {
			console.error(`Error fetching task ${taskId} for edit:`, error);
		}
	};

	return (
		<div
			className={`${styles.background} ${styles.border} p-4 rounded-lg border-2 transition-colors`}
		>
			<div className="flex justify-between items-center mb-4">
				<h3
					className={`text-lg font-semibold flex items-center gap-2 ${styles.header}`}
				>
					{title}
					<span className="text-sm opacity-70">({columnTasks.length})</span>
				</h3>
				<button
					onClick={() => onAddTask(id)}
					className={`p-2 ${styles.button} rounded-full transition-colors`}
					title={`Add ${title} task`}
				>
					<Plus className="w-5 h-5" />
				</button>
			</div>

			<div ref={setNodeRef} className="min-h-[300px]">
				<SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
					{columnTasks.length > 0 ? (
						<div className="space-y-3">
							{columnTasks.map((task) => (
								<Task
									key={task._id || `task-${task.title}-${Math.random()}`}
									task={task}
									onDelete={handleDeleteTask}
									onEdit={handleEditTask}
									allTasks={allTasks}
								/>
							))}
						</div>
					) : (
						<div
							className={`flex items-center justify-center h-32 border-2 border-dashed rounded-md ${styles.border} opacity-50`}
						>
							<p className={`${styles.header} opacity-60`}>No tasks</p>
						</div>
					)}
				</SortableContext>
			</div>
		</div>
	);
};

export default TaskColumn;
