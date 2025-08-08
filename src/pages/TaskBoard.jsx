import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
} from "react";
import {
	DndContext,
	DragOverlay,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	closestCorners,
	pointerWithin,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskColumn from "../components/TaskColumn";
import TaskForm from "./TaskForm";
import TaskFilter from "../components/TaskFilter";
import {
	Activity,
	Palette,
	Edit2,
	Clock,
	Users,
	Calendar,
	Shield,
	Star,
	UserX,
	ChevronDown,
	ChevronUp,
	Settings,
	Menu,
	UserRound,
	User,
} from "lucide-react";
import { useTaskContext } from "../context/TaskContext";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "../context/DashboardContext";
import { useTaskReminders } from "../hooks/useTaskReminders";
import { toast } from "react-hot-toast";
import {
	isBefore,
	parseISO,
	isWithinInterval,
	startOfToday,
	endOfToday,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	formatDistanceToNow,
} from "date-fns";
import { useParams } from "react-router-dom";
import useAxiosPublic from "../hooks/useAxiosPublic";
import TeamManagementModal from "../components/TeamManagementModal";

const categories = ["To-Do", "In Progress", "Done"];

const TaskBoard = () => {
	const { id: dashboardId } = useParams();
	const { user } = useAuth();
	const {
		dashboards,
		activeDashboard,
		dashboardTasks,
		members,
		switchDashboard,
		updateDashboardName,
		updateMemberRole,
		removeMember,
		fetchDashboardTasks,
		setDashboardTasks,
		loading: contextLoading,
	} = useDashboard();
	const axiosPublic = useAxiosPublic();

	// Local state for component-specific data
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [dashboardInfo, setDashboardInfo] = useState(null);

	const {
		tasks,
		loading: isLoading,
		deleteTask,
		updateTask,
		createTask,
		fetchTasks,
		setTasks,
		error: taskError,
	} = useTaskContext();

	// Initialize task reminders
	useTaskReminders();

	// Configure drag sensors with more reliable settings
	const mouseSensor = useSensor(MouseSensor, {
		// Simplify activation constraint to avoid undefined errors
		activationConstraint: {
			distance: 8, // Pixels required to move before activation
		},
	});

	const touchSensor = useSensor(TouchSensor, {
		// Simplify activation constraint to avoid undefined errors
		activationConstraint: {
			delay: 250, // ms delay before activation
			tolerance: 8, // Pixels of tolerance
		},
	});

	const sensors = useSensors(mouseSensor, touchSensor);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [currentTask, setCurrentTask] = useState(null);
	const [formCategory, setFormCategory] = useState("To-Do");
	const [activities, setActivities] = useState([]);
	const [showActivityLog, setShowActivityLog] = useState(false);
	const [bannerColor, setBannerColor] = useState(
		() => localStorage.getItem("taskboardBannerColor") || "#6366f1"
	);
	const [boardName, setBoardName] = useState(
		() => localStorage.getItem("taskboardName") || "Task Board"
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [priorityFilter, setPriorityFilter] = useState("");
	const [dueDateFilter, setDueDateFilter] = useState("");
	const [showOverdue, setShowOverdue] = useState(false);
	const [activeTask, setActiveTask] = useState(null);
	const [forceUpdate, setForceUpdate] = useState(0); // Force re-render counter

	// Replace showMembersPanel with showTeamModal
	const [showTeamModal, setShowTeamModal] = useState(false);
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [showNameEditor, setShowNameEditor] = useState(false);

	// Check if current user is an admin for the dashboard
	const isCurrentUserAdmin = useMemo(() => {
		if (!user || !activeDashboard || !activeDashboard.members) {
			return false;
		}

		const currentMember = activeDashboard.members.find(
			(member) => member.email === user.email || member.uid === user.uid
		);

		const isAdmin = currentMember && currentMember.role === "Admin";

		return isAdmin;
	}, [user, activeDashboard]);

	// Handle updating member role
	const handleUpdateMemberRole = async (memberId, newRole) => {
		if (!dashboardId || !isCurrentUserAdmin) return;

		try {
			// Use the updateMemberRole function from DashboardContext
			const success = await updateMemberRole(dashboardId, memberId, newRole);

			if (success) {
				let roleText;
				if (newRole === "Admin") {
					roleText = "promoted to Admin";
				} else if (newRole === "Editor") {
					roleText = "set as Editor";
				} else {
					roleText = "changed to Member";
				}

				addActivity(`Team member ${roleText}`);
				setShowTeamModal(false);
			}
		} catch (error) {
			console.error("Error updating member role:", error);
			toast.error("Failed to update member role");
		}
	};

	// Handle removing a member
	const handleRemoveMember = async (memberId) => {
		if (!dashboardId || !isCurrentUserAdmin) return;

		try {
			// Use the removeMember function from DashboardContext
			const success = await removeMember(dashboardId, memberId);

			if (success) {
				addActivity("Team member removed from dashboard");
				setShowTeamModal(false);
			}
		} catch (error) {
			console.error("Error removing member:", error);
			toast.error("Failed to remove member");
		}
	};

	// Fetch tasks for the current dashboard using DashboardContext
	useEffect(() => {
		if (dashboardId && user?.email) {
			fetchDashboardTasks(dashboardId);
		}
	}, [dashboardId, user?.email, fetchDashboardTasks]);

	useEffect(() => {
		if (dashboardId && dashboards.length > 0) {
			// Find the current dashboard from the dashboards array
			const currentDashboard = dashboards.find((d) => d._id === dashboardId);
			if (currentDashboard) {
				setDashboardInfo(currentDashboard);
				// Update the board name if found
				setBoardName(currentDashboard.name);
				// Switch to this dashboard in the context if it's not already active
				if (!activeDashboard || activeDashboard._id !== dashboardId) {
					switchDashboard(currentDashboard); // Pass the full dashboard object
				}
			}
		}
	}, [dashboardId, dashboards, switchDashboard]);

	// Stabilize dashboardTasks with useMemo to prevent unnecessary re-renders
	const stableDashboardTasks = useMemo(() => {
		// Simple length and first item check for better performance
		if (!Array.isArray(dashboardTasks)) {
			return [];
		}
		console.log("🔍 stableDashboardTasks updated:", dashboardTasks);
		return dashboardTasks;
	}, [dashboardTasks]);

	// Filter tasks based on search and filters (use stableDashboardTasks instead of dashboardTasks)
	const filteredTasks = useMemo(() => {
		return stableDashboardTasks.filter((task) => {
			// Search query filter
			if (
				searchQuery &&
				!task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
				!task.description.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return false;
			}

			// Priority filter
			if (priorityFilter && task.priority !== priorityFilter) {
				return false;
			}

			// Due date filter
			if (dueDateFilter && task.dueDate) {
				const dueDate = parseISO(task.dueDate);
				const today = new Date();

				switch (dueDateFilter) {
					case "today":
						if (
							!isWithinInterval(dueDate, {
								start: startOfToday(),
								end: endOfToday(),
							})
						)
							return false;
						break;
					case "week":
						if (
							!isWithinInterval(dueDate, {
								start: startOfWeek(today),
								end: endOfWeek(today),
							})
						)
							return false;
						break;
					case "month":
						if (
							!isWithinInterval(dueDate, {
								start: startOfMonth(today),
								end: endOfMonth(today),
							})
						)
							return false;
						break;
				}
			}

			// Overdue filter
			if (showOverdue) {
				if (!task.dueDate || !isBefore(parseISO(task.dueDate), new Date())) {
					return false;
				}
			}

			return true;
		});
	}, [
		stableDashboardTasks,
		searchQuery,
		priorityFilter,
		dueDateFilter,
		showOverdue,
	]);

	// Organize filtered tasks by category
	const tasksByCategory = useMemo(() => {
		const result = categories.reduce((acc, category) => {
			acc[category] = filteredTasks.filter(
				(task) => task.category === category
			);
			return acc;
		}, {});
		console.log("🔍 tasksByCategory updated:", result);
		return result;
	}, [filteredTasks]);

	// Handle drag and drop
	const handleDragStart = (event) => {
		const { active } = event;
		const task = stableDashboardTasks.find((t) => t._id === active.id);
		if (task) {
			setActiveTask(task);
			document.body.style.cursor = "grabbing";
		}
	};

	const handleDragOver = (event) => {
		const { active, over } = event;
		if (!active || !over) return;

		const activeId = active.id;
		const overId = over.id;

		if (activeId === overId) return;

		const activeTask = stableDashboardTasks.find((t) => t._id === activeId);
		if (!activeTask) return;

		// Determine the target category
		let newCategory;
		if (categories.includes(over.id)) {
			// Dropping directly onto a column
			newCategory = over.id;
		} else {
			// Dropping onto another task
			const overTask = stableDashboardTasks.find((t) => t._id === overId);
			if (!overTask) return;
			newCategory = overTask.category;
		}

		// The DashboardContext will handle real-time updates from socket events
		// No need to update local state here for preview
	};

	const handleDragEnd = async (event) => {
		const { active, over } = event;
		document.body.style.cursor = "";
		setActiveTask(null);

		console.log("🔍 Drag End Debug:", {
			active,
			over,
			activeId: active?.id,
			overId: over?.id,
		});

		if (!over) {
			console.log("🔍 No valid drop target");
			// If dropped outside a valid target, just refresh tasks from context
			if (dashboardId) {
				fetchDashboardTasks(dashboardId);
			}
			return;
		}

		const activeId = active.id;
		const activeTaskData = stableDashboardTasks.find((t) => t._id === activeId);
		if (!activeTaskData) {
			console.log("🔍 Active task not found:", activeId);
			return;
		}

		let newCategory;
		if (categories.includes(over.id)) {
			newCategory = over.id;
		} else {
			const overTask = stableDashboardTasks.find((t) => t._id === over.id);
			if (!overTask) {
				console.log("🔍 Over task not found:", over.id);
				return;
			}
			newCategory = overTask.category;
		}

		console.log("🔍 Drag Details:", {
			currentCategory: activeTaskData.category,
			newCategory,
			taskTitle: activeTaskData.title,
		});

		if (activeTaskData.category !== newCategory) {
			try {
				setLoading(true);
				console.log("🔍 Making API call to move task");
				const response = await axiosPublic.patch(
					`/dashboard-tasks/${activeId}?email=${user.email}`,
					{ category: newCategory }
				);

				console.log("🔍 API Response:", response.data);

				if (response.data) {
					// Force immediate UI update without depending on socket events
					const updatedTask = { ...activeTaskData, category: newCategory };

					console.log(
						"🔍 Current dashboardTasks before update:",
						dashboardTasks
					);
					console.log("🔍 Updated task:", updatedTask);

					// Update the context immediately
					setDashboardTasks((prevTasks) => {
						const updatedTasks = prevTasks.map((task) =>
							task._id === activeId ? updatedTask : task
						);
						console.log("🔍 Setting new dashboardTasks:", updatedTasks);
						return updatedTasks;
					});

					// Force re-render
					setForceUpdate((prev) => prev + 1);

					addActivity(`Task "${activeTaskData.title}" moved to ${newCategory}`);
					toast.success(`Task moved to ${newCategory}`);
				}
			} catch (error) {
				console.error("🔍 Error moving task:", error);
				toast.error("Failed to move task");
				// Refresh tasks on error
				if (dashboardId) {
					fetchDashboardTasks(dashboardId);
				}
			} finally {
				setLoading(false);
			}
		} else {
			console.log("🔍 Task is already in target category");
		}
	};

	const handleDragCancel = () => {
		document.body.style.cursor = "";
		setActiveTask(null);
	};

	// Memoize addActivity function
	const addActivity = useCallback(
		(message) => {
			const activity = {
				id: Date.now(),
				message,
				timestamp: new Date().toISOString(),
				user: user?.displayName || user?.email || "Anonymous",
			};
			setActivities((prev) => [activity, ...prev]);
		},
		[user]
	);

	// Form handlers with useCallback to prevent re-renders
	const handleAddTask = useCallback((category) => {
		setCurrentTask(null);
		setFormCategory(category);
		setIsFormOpen(true);
	}, []);

	const handleEditTask = useCallback((task) => {
		setCurrentTask(task);
		setFormCategory(task.category);
		setIsFormOpen(true);
	}, []);

	const handleDeleteTask = useCallback(
		async (taskId) => {
			const taskToDelete = stableDashboardTasks.find((t) => t._id === taskId);
			if (!taskToDelete) return false;

			try {
				setLoading(true);
				await axiosPublic.delete(`/task-delete/${taskId}`);

				// Immediate local update
				setDashboardTasks((prevTasks) => {
					const updatedTasks = prevTasks.filter((task) => task._id !== taskId);
					return updatedTasks;
				});

				addActivity(`Task "${taskToDelete.title}" deleted`);
				toast.success(`Task "${taskToDelete.title}" deleted`);
				return true;
			} catch (error) {
				console.error("Error deleting task:", error);
				toast.error("Failed to delete task");
				return false;
			} finally {
				setLoading(false);
			}
		},
		[stableDashboardTasks, axiosPublic, addActivity]
	);

	const handleFormSubmit = async (taskData) => {
		try {
			setLoading(true);

			if (currentTask) {
				// Editing existing task
				const response = await axiosPublic.patch(
					`/dashboard-tasks/${currentTask._id}?email=${user.email}`,
					taskData
				);

				if (response.data) {
					// Immediate local update
					const updatedTask = { ...currentTask, ...taskData };
					setDashboardTasks((prevTasks) => {
						const updatedTasks = prevTasks.map((task) =>
							task._id === currentTask._id ? updatedTask : task
						);
						return updatedTasks;
					});
				}

				addActivity(`Task "${taskData.title}" updated`);
				toast.success(`Task "${taskData.title}" updated successfully`);
			} else {
				// Creating new task
				const res = await axiosPublic.post(
					`/dashboard-tasks/${dashboardId}?email=${user.email}`,
					{ ...taskData, category: formCategory }
				);

				if (res.data) {
					// Immediate local update
					const newTask = res.data;
					setDashboardTasks((prevTasks) => {
						const updatedTasks = [...prevTasks, newTask];
						return updatedTasks;
					});
				}
				addActivity(`New task "${taskData.title}" created in ${formCategory}`);
				toast.success(`Task "${taskData.title}" created successfully`);
			}
		} catch (err) {
			console.error("Error submitting task:", err);
			toast.error(
				`Failed to ${currentTask ? "update" : "create"} task: ${
					err.response?.data?.message || err.message
				}`
			);
		} finally {
			setIsFormOpen(false);
			setLoading(false);
			setCurrentTask(null);
		}
	};

	const handleSaveBoardName = async () => {
		if (!dashboardId || !user?.email) {
			toast.error("Cannot update dashboard name");
			return;
		}

		try {
			setLoading(true);
			// Use the updateDashboardName function from DashboardContext
			const success = await updateDashboardName(dashboardId, boardName);

			if (success) {
				// The DashboardContext's updateDashboardName already updates
				// all necessary states in the application, so we just need to
				// update local component state and show UI feedback
				setDashboardInfo((prev) =>
					prev ? { ...prev, name: boardName } : null
				);
				addActivity(`Dashboard name changed to "${boardName}"`);
				// Toast is already shown by updateDashboardName function
			} else {
				// If the update failed, revert to original name
				if (dashboardInfo) {
					setBoardName(dashboardInfo.name);
				}
			}
		} catch (error) {
			console.error("Error updating dashboard name:", error);
			toast.error("Failed to update dashboard name");
			// Revert to original name if saved in dashboardInfo
			if (dashboardInfo) {
				setBoardName(dashboardInfo.name);
			}
		} finally {
			setLoading(false);
			setShowNameEditor(false);
		}
	};

	// Persist board customization
	useEffect(() => {
		localStorage.setItem("taskboardBannerColor", bannerColor);
	}, [bannerColor]);

	useEffect(() => {
		localStorage.setItem("taskboardName", boardName);
	}, [boardName]);

	// Loading state - show loading only for initial load or when no user
	if (!user || (contextLoading && dashboards.length === 0)) {
		return (
			<div className="h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
					<p className="text-gray-600 dark:text-gray-400">
						Loading dashboard...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
			{/* Banner */}
			<div
				style={{ backgroundColor: bannerColor }}
				className="p-6 shadow-lg relative overflow-hidden"
			>
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-4">
							<h1 className="text-2xl font-bold text-white">{boardName}</h1>
							<button
								onClick={() => setShowNameEditor(true)}
								className="p-2 hover:bg-white/10 rounded-full transition-colors"
							>
								<Edit2 size={16} className="text-white" />
							</button>
						</div>

						{/* Dashboard details section */}
						{dashboardInfo && (
							<div className="flex items-center gap-4 text-white/80 text-sm">
								{dashboardInfo.createdAt && (
									<div className="flex items-center gap-1">
										<Calendar size={14} />
										<span>
											Created{" "}
											{formatDistanceToNow(new Date(dashboardInfo.createdAt), {
												addSuffix: true,
											})}
										</span>
									</div>
								)}
								<div className="flex items-center gap-1">
									<Users size={14} />
									<span>
										{members?.length || dashboardInfo.members?.length || 0}
										{members?.length === 1 ||
										dashboardInfo.members?.length === 1
											? " member"
											: " members"}
									</span>
								</div>
								{dashboardInfo.createdBy && (
									<div className="flex items-center gap-1">
										<span>
											{dashboardInfo.createdBy.email === user?.email
												? "You are admin"
												: `Created by ${
														dashboardInfo.createdBy.name ||
														dashboardInfo.createdBy.email ||
														"Unknown"
												  }`}
										</span>
									</div>
								)}
							</div>
						)}
					</div>
					<div className="flex items-center gap-4">
						<button
							onClick={() => setShowTeamModal(true)}
							className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
						>
							<Users size={16} />
							Team Members
						</button>
						<button
							onClick={() => setShowActivityLog(!showActivityLog)}
							className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
						>
							<Activity size={16} />
							Activity Log
						</button>
						<button
							onClick={() => setShowColorPicker(true)}
							className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
						>
							<Palette size={16} />
							Change Color
						</button>
					</div>
				</div>
				<div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
			</div>

			<div className="flex-1 p-6 space-y-6">
				{/* Add error and loading indicators */}
				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						<p>Error loading tasks: {error}</p>
					</div>
				)}

				{loading ? (
					<div className="flex items-center justify-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
						<p className="ml-3 text-gray-600">Loading tasks...</p>
					</div>
				) : (
					// Existing DndContext and rest of the component
					<DndContext
						sensors={sensors}
						collisionDetection={closestCorners}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
					>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
							{categories.map((category) => {
								const categoryTasks = tasksByCategory[category] || [];
								return (
									<SortableContext
										key={category}
										items={categoryTasks.map((task) => task._id)}
									>
										<TaskColumn
											id={category}
											title={category}
											tasks={categoryTasks}
											onAddTask={handleAddTask}
											onDeleteTask={handleDeleteTask}
											onEditTask={handleEditTask}
										/>
									</SortableContext>
								);
							})}
						</div>
						<DragOverlay>
							{activeTask ? (
								<div className="p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 max-w-md">
									<h3 className="font-medium">{activeTask.title}</h3>
									{activeTask.priority && (
										<span
											className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
												activeTask.priority === "High"
													? "bg-red-100 text-red-800"
													: activeTask.priority === "Medium"
													? "bg-yellow-100 text-yellow-800"
													: "bg-green-100 text-green-800"
											}`}
										>
											{activeTask.priority}
										</span>
									)}
								</div>
							) : null}
						</DragOverlay>
					</DndContext>
				)}

				{/* Activity Log */}
				{showActivityLog && (
					<div className="fixed right-6 top-24 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Activity Log</h3>
							<button
								onClick={() => setShowActivityLog(false)}
								className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							>
								×
							</button>
						</div>
						<div className="max-h-96 overflow-y-auto space-y-2">
							{activities.map((activity) => (
								<div
									key={activity.id}
									className="text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded"
								>
									<p className="text-gray-900 dark:text-white">
										{activity.message}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{new Date(activity.timestamp).toLocaleString()} by{" "}
										{activity.user}
									</p>
								</div>
							))}
							{activities.length === 0 && (
								<p className="text-center text-gray-500 dark:text-gray-400">
									No activities yet
								</p>
							)}
						</div>
					</div>
				)}

				{/* Task Form Modal */}
				{isFormOpen && (
					<TaskForm
						isOpen={isFormOpen}
						onClose={() => setIsFormOpen(false)}
						onSubmit={handleFormSubmit}
						initialData={currentTask}
						columnId={formCategory}
					/>
				)}

				{/* Color Picker Modal */}
				{showColorPicker && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
							<h3 className="text-lg font-semibold mb-4">Change Board Color</h3>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<label className="text-sm">Select a new color:</label>
									<input
										type="color"
										value={bannerColor}
										onChange={(e) => setBannerColor(e.target.value)}
										className="w-full h-12 cursor-pointer rounded border"
									/>
								</div>
								<div className="flex justify-end gap-2">
									<button
										onClick={() => setShowColorPicker(false)}
										className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
									>
										Cancel
									</button>
									<button
										onClick={() => setShowColorPicker(false)}
										className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
									>
										Apply
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Board Name Editor Modal */}
				{showNameEditor && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
							<h3 className="text-lg font-semibold mb-4">Change Board Name</h3>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<label className="text-sm">Enter a new name:</label>
									<input
										type="text"
										value={boardName}
										onChange={(e) => setBoardName(e.target.value)}
										className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
										placeholder="Enter dashboard name"
									/>
								</div>
								<div className="flex justify-end gap-2">
									<button
										onClick={() => setShowNameEditor(false)}
										className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
									>
										Cancel
									</button>
									<button
										onClick={handleSaveBoardName}
										className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
									>
										Save
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Team Management Modal */}
				<TeamManagementModal
					dashboardId={dashboardId}
					isOpen={showTeamModal}
					onClose={() => setShowTeamModal(false)}
					isCurrentUserAdmin={isCurrentUserAdmin}
					activeDashboard={activeDashboard}
					members={members}
				/>

				{/* Dashboard Actions Bar */}
				<div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 shadow-sm rounded-lg mb-4">
					<div className="flex items-center">
						<Menu className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
						<div>
							<h2 className="text-lg font-semibold">
								{activeDashboard?.name || "Dashboard"}
							</h2>
							<div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
								<UserRound size={14} className="mr-1" />
								{activeDashboard?.members?.length || 1}{" "}
								{activeDashboard?.members?.length === 1 ? "member" : "members"}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TaskBoard;
