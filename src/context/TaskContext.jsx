import { createContext, useContext, useState, useEffect } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { useAuth } from "../hooks/useAuth";
import { useBoard } from "./BoardContext";
import { toast } from "react-hot-toast";
import { socket } from "../socket/socket";

const TaskContext = createContext();

// Primary hook to use the task context
export const useTaskContext = () => {
	const context = useContext(TaskContext);
	if (!context) {
		throw new Error("useTaskContext must be used within a TaskProvider");
	}
	return context;
};

// Alias for backward compatibility
export const useTask = () => useTaskContext();

// Task priority levels
export const PRIORITY_LEVELS = {
	URGENT: "urgent",
	HIGH: "high",
	MEDIUM: "medium",
	LOW: "low",
	NONE: "none",
};

// Task statuses beyond the basic ones
export const TASK_STATUS = {
	TODO: "todo",
	IN_PROGRESS: "inProgress",
	COMPLETE: "complete",
	BLOCKED: "blocked",
	REVIEW: "review",
	BACKLOG: "backlog",
	ARCHIVED: "archived",
};

export const TaskProvider = ({ children }) => {
	const { user } = useAuth();
	const { activeBoard } = useBoard();
	const axiosPublic = useAxiosPublic();

	const [tasks, setTasks] = useState([]);
	const [filteredTasks, setFilteredTasks] = useState([]);
	const [selectedTask, setSelectedTask] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		status: [],
		priority: [],
		assignee: [],
		dueDate: null,
		search: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	// Add transitioning state
	const [isTransitioning, setIsTransitioning] = useState(false);

	// Fetch tasks for the current active board
	const fetchTasks = async () => {
		if (!activeBoard?._id || !user?.email) {
			console.log("Cannot fetch tasks: Missing activeBoard or user", {
				hasActiveBoard: !!activeBoard,
				activeBoardId: activeBoard?._id,
				hasUser: !!user,
				userEmail: user?.email,
			});
			setTasks([]); // Set empty array explicitly
			setFilteredTasks([]);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			console.log(`Attempting to fetch tasks for board: ${activeBoard._id}`);
			// Log the full URL for debugging
			const url = `/boards/${activeBoard._id}/tasks`;
			console.log(`API Request URL: ${url}`);

			const response = await axiosPublic.get(url);

			console.log(
				`Fetched ${response?.data?.length || 0} tasks for board ${
					activeBoard.name
				} (${activeBoard._id})`
			);

			if (!response.data || !Array.isArray(response.data)) {
				console.error("Invalid data format received:", response.data);
				throw new Error("Invalid data format received from server");
			}

			// Update tasks state with the fetched data
			setTasks(response.data);

			// Apply filters directly to the fetched data
			applyFilters(response.data);
		} catch (error) {
			console.error("Error fetching tasks:", error);
			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				"Failed to fetch tasks. Please ensure your backend server is running.";
			setError(errorMessage);
			setTasks([]); // Set empty array on error
			setFilteredTasks([]);
			toast.error(`Error loading tasks: ${errorMessage}`);
		} finally {
			setLoading(false);
		}
	};

	// Create a new task
	const createTask = async (taskData) => {
		if (!activeBoard?._id || !user?.email) return null;

		try {
			setLoading(true);

			// Validate required fields
			if (!taskData.title) {
				throw new Error("Task title is required");
			}

			const newTask = {
				...taskData,
				boardId: activeBoard._id,
				status: taskData.status || TASK_STATUS.TODO,
				priority: taskData.priority || PRIORITY_LEVELS.MEDIUM,
				createdBy: {
					uid: user.uid,
					email: user.email,
					name: user.displayName || user.email,
					photoURL: user.photoURL,
				},
				// For recurring tasks
				isRecurring: taskData.isRecurring || false,
				recurrencePattern: taskData.recurrencePattern || null,
				// Task visibility
				isPrivate: taskData.isPrivate || false,
				allowedViewers: taskData.allowedViewers || [],
				createdAt: new Date(),
			};

			const response = await axiosPublic.post("/tasks", newTask);

			// Update tasks using functional update to ensure we have the latest state
			setTasks((prev) => {
				const updatedTasks = [...prev, response.data];
				// Apply filters will be called automatically by the useEffect
				return updatedTasks;
			});

			toast.success("Task created successfully");
			return response.data;
		} catch (error) {
			console.error("Error creating task:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to create task";
			toast.error(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	};

	// Update an existing task
	const updateTask = async (taskId, updates) => {
		if (!user?.email) return null;

		try {
			setLoading(true);

			// Find the task to update
			const taskToUpdate = tasks.find((t) => t._id === taskId);
			if (!taskToUpdate) {
				throw new Error("Task not found");
			}

			// Check if user has permission to update the task
			const hasPermission = canModifyTask(taskToUpdate);
			if (!hasPermission) {
				throw new Error("You don't have permission to update this task");
			}

			const response = await axiosPublic.patch(`/tasks/${taskId}`, updates);

			// Update local state using functional update pattern
			setTasks((prev) =>
				prev.map((task) => (task._id === taskId ? response.data : task))
			);

			// Update selected task if it's the one being modified
			if (selectedTask?._id === taskId) {
				setSelectedTask(response.data);
			}

			toast.success("Task updated successfully");
			return response.data;
		} catch (error) {
			console.error("Error updating task:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to update task";
			toast.error(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	};

	// Update task status
	const updateTaskStatus = async (taskId, status) => {
		if (!taskId || !status) return null;

		try {
			const response = await axiosPublic.patch(`/tasks/${taskId}`, { status });

			// Update local state using functional update pattern
			setTasks((prev) => {
				const updatedTasks = prev.map((task) =>
					task._id === taskId ? { ...task, status: response.data.status } : task
				);
				return updatedTasks;
			});

			// Also update selectedTask if it's the one being modified
			if (selectedTask?._id === taskId) {
				setSelectedTask((prev) => ({ ...prev, status: response.data.status }));
			}

			toast.success(`Task moved to ${status}`);
			return response.data;
		} catch (error) {
			console.error("Error updating task status:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to update task status";
			toast.error(errorMessage);
			return null;
		}
	};

	// Delete a task
	const deleteTask = async (taskId) => {
		if (!user?.email) return false;

		try {
			setLoading(true);

			// Find the task to delete
			const taskToDelete = tasks.find((t) => t._id === taskId);
			if (!taskToDelete) {
				throw new Error("Task not found");
			}

			// Check if user has permission to delete the task
			const hasPermission = canModifyTask(taskToDelete);
			if (!hasPermission) {
				throw new Error("You don't have permission to delete this task");
			}

			await axiosPublic.delete(`/tasks/${taskId}`);

			// Update local state using functional update pattern
			setTasks((prev) => prev.filter((task) => task._id !== taskId));

			// Clear selected task if it's the one being deleted
			if (selectedTask?._id === taskId) {
				setSelectedTask(null);
			}

			toast.success("Task deleted successfully");
			return true;
		} catch (error) {
			console.error("Error deleting task:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to delete task";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Add dependency between tasks
	const addTaskDependency = async (taskId, dependsOnTaskId) => {
		if (!user?.email) return null;

		try {
			setLoading(true);

			// Make sure the tasks exist
			const task = tasks.find((t) => t._id === taskId);
			const dependsOnTask = tasks.find((t) => t._id === dependsOnTaskId);

			if (!task || !dependsOnTask) {
				throw new Error("One or both tasks not found");
			}

			// Check for circular dependencies
			if (dependsOnTask.dependencies?.includes(taskId)) {
				throw new Error("Circular dependency detected");
			}

			const response = await axiosPublic.post(`/tasks/${taskId}/dependencies`, {
				dependsOnTaskId,
			});

			// Update local state using functional update pattern
			setTasks((prev) =>
				prev.map((task) => (task._id === taskId ? response.data : task))
			);

			// Update selected task if it's the one being modified
			if (selectedTask?._id === taskId) {
				setSelectedTask(response.data);
			}

			toast.success("Task dependency added");
			return response.data;
		} catch (error) {
			console.error("Error adding task dependency:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to add dependency";
			toast.error(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	};

	// Remove dependency between tasks
	const removeTaskDependency = async (taskId, dependsOnTaskId) => {
		if (!user?.email) return null;

		try {
			setLoading(true);

			const response = await axiosPublic.delete(
				`/tasks/${taskId}/dependencies/${dependsOnTaskId}`
			);

			// Update local state using functional update pattern
			setTasks((prev) =>
				prev.map((task) => (task._id === taskId ? response.data : task))
			);

			// Update selected task if it's the one being modified
			if (selectedTask?._id === taskId) {
				setSelectedTask(response.data);
			}

			toast.success("Task dependency removed");
			return response.data;
		} catch (error) {
			console.error("Error removing task dependency:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to remove dependency";
			toast.error(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	};

	// Assign a task to a user
	const assignTask = async (taskId, assigneeInfo) => {
		if (!user?.email) return null;

		try {
			setLoading(true);

			// Find the task to update
			const taskToUpdate = tasks.find((t) => t._id === taskId);
			if (!taskToUpdate) {
				throw new Error("Task not found");
			}

			// Check if user has permission to update the task
			const hasPermission = canModifyTask(taskToUpdate);
			if (!hasPermission) {
				throw new Error("You don't have permission to update this task");
			}

			const response = await axiosPublic.patch(`/tasks/${taskId}/assign`, {
				assignee: assigneeInfo,
			});

			// Update local state using functional update pattern
			setTasks((prev) =>
				prev.map((task) => (task._id === taskId ? response.data : task))
			);

			// Update selected task if it's the one being modified
			if (selectedTask?._id === taskId) {
				setSelectedTask(response.data);
			}

			toast.success(
				`Task assigned to ${assigneeInfo.name || assigneeInfo.email}`
			);
			return response.data;
		} catch (error) {
			console.error("Error assigning task:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to assign task";
			toast.error(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	};

	// Start time tracking for a task
	const startTimeTracking = async (taskId) => {
		if (!user?.email) return null;

		try {
			const response = await axiosPublic.post(
				`/tasks/${taskId}/time-tracking/start`,
				{
					startedBy: {
						uid: user.uid,
						email: user.email,
						name: user.displayName || user.email,
					},
					startTime: new Date(),
				}
			);

			// Update local state using functional update pattern
			setTasks((prev) => {
				const updatedTasks = prev.map((task) =>
					task._id === taskId ? response.data : task
				);
				return updatedTasks;
			});

			// Update selected task if it's the one being modified
			if (selectedTask?._id === taskId) {
				setSelectedTask(response.data);
			}

			toast.success("Time tracking started");
			return response.data;
		} catch (error) {
			console.error("Error starting time tracking:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to start time tracking";
			toast.error(errorMessage);
			return null;
		}
	};

	// Stop time tracking for a task
	const stopTimeTracking = async (taskId) => {
		if (!user?.email) return null;

		try {
			const response = await axiosPublic.post(
				`/tasks/${taskId}/time-tracking/stop`,
				{
					stoppedBy: {
						uid: user.uid,
						email: user.email,
						name: user.displayName || user.email,
					},
					endTime: new Date(),
				}
			);

			// Update local state using functional update pattern
			setTasks((prev) =>
				prev.map((task) => (task._id === taskId ? response.data : task))
			);

			// Update selected task if it's the one being modified
			if (selectedTask?._id === taskId) {
				setSelectedTask(response.data);
			}

			toast.success("Time tracking stopped");
			return response.data;
		} catch (error) {
			console.error("Error stopping time tracking:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to stop time tracking";
			toast.error(errorMessage);
			return null;
		}
	};

	// Add comment to a task
	const addComment = async (taskId, comment) => {
		if (!user?.email) return null;

		try {
			const response = await axiosPublic.post(`/tasks/${taskId}/comments`, {
				text: comment,
				author: {
					uid: user.uid,
					email: user.email,
					name: user.displayName || user.email,
				},
			});

			// Update local state using functional update pattern
			setTasks((prev) =>
				prev.map((task) => (task._id === taskId ? response.data : task))
			);

			// Update selected task if it's the one being modified
			if (selectedTask?._id === taskId) {
				setSelectedTask(response.data);
			}

			toast.success("Comment added");
			return response.data;
		} catch (error) {
			console.error("Error adding comment:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to add comment";
			toast.error(errorMessage);
			return null;
		}
	};

	// Create a task template from existing task
	const saveTaskAsTemplate = async (taskId, templateName) => {
		if (!user?.email) return null;

		try {
			setLoading(true);

			// Find the task to create template from
			const task = tasks.find((t) => t._id === taskId);
			if (!task) {
				throw new Error("Task not found");
			}

			// Create the template object
			const template = {
				name: templateName,
				description: task.description,
				priority: task.priority,
				estimatedTime: task.estimatedTime,
				labels: task.labels,
				// Don't include specific data like assignee or due date
				createdBy: {
					uid: user.uid,
					email: user.email,
					name: user.displayName || user.email,
					photoURL: user.photoURL,
				},
				boardId: activeBoard._id,
				isPrivate: false, // By default templates are available to the team
			};

			const response = await axiosPublic.post("/task-templates", template);

			toast.success("Task saved as template");
			return response.data;
		} catch (error) {
			console.error("Error saving task template:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to save template";
			toast.error(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	};

	// Get all templates available to the current user
	const getTaskTemplates = async () => {
		if (!user?.email || !activeBoard?._id) return [];

		try {
			setLoading(true);
			const response = await axiosPublic.get(
				`/task-templates?boardId=${activeBoard._id}`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching task templates:", error);
			return [];
		} finally {
			setLoading(false);
		}
	};

	// Create a task from template
	const createTaskFromTemplate = async (templateId, customData = {}) => {
		if (!user?.email || !activeBoard?._id) return null;

		try {
			setLoading(true);

			// First get the template
			const templateResponse = await axiosPublic.get(
				`/task-templates/${templateId}`
			);
			const template = templateResponse.data;

			// Create a new task using the template as a base
			const newTaskData = {
				title: customData.title || template.name,
				description: customData.description || template.description,
				priority: customData.priority || template.priority,
				estimatedTime: customData.estimatedTime || template.estimatedTime,
				labels: customData.labels || template.labels,
				dueDate: customData.dueDate || null,
				// Add any custom fields that were passed
				...customData,
				// Always set these fields
				boardId: activeBoard._id,
				status: TASK_STATUS.TODO,
				createdBy: {
					uid: user.uid,
					email: user.email,
					name: user.displayName || user.email,
					photoURL: user.photoURL,
				},
				createdAt: new Date(),
			};

			// Call the existing createTask function
			return await createTask(newTaskData);
		} catch (error) {
			console.error("Error creating task from template:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to create task from template";
			toast.error(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	};

	// Check if user can modify a task
	const canModifyTask = (task) => {
		if (!user || !activeBoard) return false;

		// Task creator can always modify their tasks
		if (task.createdBy?.uid === user.uid) return true;

		// Check board permissions
		const userMember = activeBoard.members?.find((m) => m.uid === user.uid);

		// Admins and managers can modify any task
		if (userMember && ["admin", "manager"].includes(userMember.role))
			return true;

		// Contributors can modify tasks assigned to them
		if (userMember && userMember.role === "contributor") {
			return task.assignee?.uid === user.uid;
		}

		// Viewers can't modify tasks
		return false;
	};

	// Check if user can view a task
	const canViewTask = (task) => {
		if (!user || !activeBoard) return false;

		// If the task isn't private, any board member can view it
		if (!task.isPrivate) return true;

		// Task creator can always view their tasks
		if (task.createdBy?.uid === user.uid) return true;

		// Check if user is explicitly allowed to view this task
		if (task.allowedViewers?.some((viewer) => viewer.uid === user.uid))
			return true;

		// Check board permissions - admins and managers can view all tasks
		const userMember = activeBoard.members?.find((m) => m.uid === user.uid);
		if (userMember && ["admin", "manager"].includes(userMember.role))
			return true;

		return false;
	};

	// Apply all current filters to the tasks
	const applyFilters = (taskList = tasks) => {
		if (!taskList || taskList.length === 0) {
			// Only log this message in development and not on every call
			if (process.env.NODE_ENV !== 'production' && taskList !== undefined) {
				console.log("No tasks to filter");
			}
			setFilteredTasks([]);
			return;
		}

		// Only log filtering info in development mode
		if (process.env.NODE_ENV !== 'production') {
			console.log(`Applying filters to ${taskList.length} tasks`);
		}
		
		let result = [...taskList];

		// Apply search filter
		if (filters.search && filters.search.trim()) {
			if (process.env.NODE_ENV !== 'production') {
				console.log(`Filtering by search query: "${filters.search}"`);
			}
			result = result.filter(
				(task) =>
					task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
					(task.description &&
						task.description
							.toLowerCase()
							.includes(filters.search.toLowerCase()))
			);
		}

		// Apply priority filter
		if (filters.priority && filters.priority.length > 0) {
			if (process.env.NODE_ENV !== 'production') {
				console.log(`Filtering by priority: ${filters.priority}`);
			}
			result = result.filter((task) =>
				filters.priority.includes(task.priority)
			);
		}

		// Apply due date filter
		if (filters.dueDate) {
			if (process.env.NODE_ENV !== 'production') {
				console.log(`Filtering by due date: ${filters.dueDate}`);
			}
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			const weekLater = new Date(today);
			weekLater.setDate(weekLater.getDate() + 7);

			result = result.filter((task) => {
				if (!task.dueDate) return false;

				const dueDate = new Date(task.dueDate);
				dueDate.setHours(0, 0, 0, 0);

				switch (filters.dueDate) {
					case "today":
						return dueDate.getTime() === today.getTime();
					case "tomorrow":
						return dueDate.getTime() === tomorrow.getTime();
					case "week":
						return dueDate > today && dueDate <= weekLater;
					case "overdue":
						return dueDate < today;
					default:
						return true;
				}
			});
		}

		// Apply assignee filter
		if (filters.assignee && filters.assignee.length > 0) {
			if (process.env.NODE_ENV !== 'production') {
				console.log(`Filtering by assignee: ${filters.assignee}`);
			}
			result = result.filter((task) => {
				// Handle special cases
				if (filters.assignee.includes("unassigned")) {
					return !task.assignedTo || task.assignedTo.length === 0;
				} else if (filters.assignee.includes("me")) {
					return (
						task.assignedTo &&
						task.assignedTo.some((assignee) => assignee.email === user.email)
					);
				} else {
					// Filter by specific assignee emails
					return (
						task.assignedTo &&
						task.assignedTo.some((assignee) =>
							filters.assignee.includes(assignee.email)
						)
					);
				}
			});
		}

		// Apply status filter
		if (filters.status && filters.status.length > 0) {
			if (process.env.NODE_ENV !== 'production') {
				console.log(`Filtering by status: ${filters.status}`);
			}
			result = result.filter((task) => filters.status.includes(task.status));
		}

		if (process.env.NODE_ENV !== 'production') {
			console.log(
				`Filter result: ${result.length} tasks remaining after filtering`
			);
		}
		
		setFilteredTasks(result);
	};

	// Update filters
	const updateFilters = (newFilters) => {
		setFilters((prev) => ({
			...prev,
			...newFilters,
		}));
	};

	// Reset all filters
	const resetFilters = () => {
		setFilters({
			status: [],
			priority: [],
			assignee: [],
			dueDate: null,
			search: "",
		});
		applyFilters(tasks);
	};

	// Fetch tasks when activeBoard or user changes
	useEffect(() => {
		if (activeBoard?._id && user?.email) {
			console.log("Fetching tasks for board:", activeBoard._id);
			fetchTasks();

			// Set up socket event listeners for real-time updates
			if (socket) {
				// Listen for task created events
				socket.on("task:created", (newTask) => {
					if (newTask.boardId === activeBoard._id) {
						setTasks((prev) => {
							const updatedTasks = [...prev, newTask];
							// Apply filters with the latest tasks
							applyFilters(updatedTasks);
							return updatedTasks;
						});
					}
				});

				// Listen for task updated events
				socket.on("task:updated", (updatedTask) => {
					if (updatedTask.boardId === activeBoard._id) {
						setTasks((prev) => {
							const updatedTasks = prev.map((task) =>
								task._id === updatedTask._id ? updatedTask : task
							);
							// Apply filters with the latest tasks
							applyFilters(updatedTasks);
							return updatedTasks;
						});

						// Update selected task if it's the one being modified
						if (selectedTask?._id === updatedTask._id) {
							setSelectedTask(updatedTask);
						}
					}
				});

				// Listen for task deleted events
				socket.on("task:deleted", (deletedTaskId) => {
					setTasks((prev) => {
						const updatedTasks = prev.filter(
							(task) => task._id !== deletedTaskId
						);
						// Apply filters with the latest tasks
						applyFilters(updatedTasks);
						return updatedTasks;
					});

					// Clear selected task if it's the one being deleted
					if (selectedTask?._id === deletedTaskId) {
						setSelectedTask(null);
					}
				});
			}

			return () => {
				// Clean up socket listeners when component unmounts
				if (socket) {
					socket.off("task:created");
					socket.off("task:updated");
					socket.off("task:deleted");
				}
			};
		}
	}, [activeBoard, user]);

	// Reapply filters when filters change or tasks change
	useEffect(() => {
		applyFilters();
	}, [filters, tasks]);

	// Value object to be provided to context consumers
	const value = {
		tasks,
		filteredTasks,
		selectedTask,
		setSelectedTask,
		loading,
		error,
		filters,
		updateFilters,
		resetFilters,
		fetchTasks,
		createTask,
		updateTask,
		updateTaskStatus,
		deleteTask,
		addTaskDependency,
		removeTaskDependency,
		assignTask,
		startTimeTracking,
		stopTimeTracking,
		addComment,
		saveTaskAsTemplate,
		getTaskTemplates,
		createTaskFromTemplate,
		canModifyTask,
		canViewTask,
		PRIORITY_LEVELS,
		TASK_STATUS,
		isLoading,
		// Provide transitioning state
		isTransitioning,
		setIsTransitioning,
	};

	return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
