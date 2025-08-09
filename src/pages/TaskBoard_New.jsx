import React, { useState, useEffect, useMemo } from "react";
import {
	DndContext,
	DragOverlay,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	closestCorners,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskColumn from "../components/TaskColumn";
import TaskForm from "./TaskForm";
import {
	Activity,
	Palette,
	Edit2,
	Users,
	Calendar,
	Menu,
	UserRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "../context/DashboardContext";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
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
		fetchDashboardTasks,
	} = useDashboard();
	const axiosPublic = useAxiosPublic();

	// State
	const [loading, setLoading] = useState(false);
	const [dashboardInfo, setDashboardInfo] = useState(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [currentTask, setCurrentTask] = useState(null);
	const [formCategory, setFormCategory] = useState("To-Do");
	const [activities, setActivities] = useState([]);
	const [showActivityLog, setShowActivityLog] = useState(false);
	const [showTeamModal, setShowTeamModal] = useState(false);
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [showNameEditor, setShowNameEditor] = useState(false);
	const [activeTask, setActiveTask] = useState(null);

	// Customization
	const [bannerColor, setBannerColor] = useState(
		localStorage.getItem("taskboardBannerColor") || "#6366f1"
	);
	const [boardName, setBoardName] = useState(
		localStorage.getItem("taskboardName") || "Task Board"
	);

	// Drag sensors
	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: { distance: 8 },
	});
	const touchSensor = useSensor(TouchSensor, {
		activationConstraint: { delay: 250, tolerance: 8 },
	});
	const sensors = useSensors(mouseSensor, touchSensor);

	// Check if current user is admin
	const isCurrentUserAdmin = useMemo(() => {
		if (!user || !activeDashboard || !activeDashboard.members) return false;
		const currentMember = activeDashboard.members.find(
			(member) => member.email === user.email || member.uid === user.uid
		);
		return currentMember && currentMember.role === "Admin";
	}, [user, activeDashboard]);

	// Fetch dashboard data
	useEffect(() => {
		if (dashboardId && user?.email) {
			fetchDashboardTasks(dashboardId);
		}
	}, [dashboardId, user?.email, fetchDashboardTasks]);

	useEffect(() => {
		if (dashboardId) {
			const currentDashboard = dashboards.find((d) => d._id === dashboardId);
			if (currentDashboard) {
				setDashboardInfo(currentDashboard);
				setBoardName(currentDashboard.name);
				if (!activeDashboard || activeDashboard._id !== dashboardId) {
					switchDashboard(currentDashboard);
				}
			}
		}
	}, [dashboardId, dashboards, activeDashboard, switchDashboard]);

	// Organize tasks by category
	const tasksByCategory = useMemo(() => {
		const tasks = Array.isArray(dashboardTasks) ? dashboardTasks : [];
		return categories.reduce((acc, category) => {
			acc[category] = tasks.filter((task) => task.category === category);
			return acc;
		}, {});
	}, [dashboardTasks]);

	// Drag and drop handlers
	const handleDragStart = (event) => {
		const { active } = event;
		const task = dashboardTasks?.find((t) => t._id === active.id);
		if (task) {
			setActiveTask(task);
			document.body.style.cursor = "grabbing";
		}
	};

	const handleDragEnd = async (event) => {
		const { active, over } = event;
		document.body.style.cursor = "";
		setActiveTask(null);

		if (!over || !dashboardTasks) return;

		const activeId = active.id;
		const activeTaskData = dashboardTasks.find((t) => t._id === activeId);
		if (!activeTaskData) return;

		let newCategory;
		if (categories.includes(over.id)) {
			newCategory = over.id;
		} else {
			const overTask = dashboardTasks.find((t) => t._id === over.id);
			if (!overTask) return;
			newCategory = overTask.category;
		}

		if (activeTaskData.category !== newCategory) {
			try {
				setLoading(true);
				await axiosPublic.patch(
					`/dashboard-tasks/${activeId}?email=${user.email}`,
					{ category: newCategory }
				);
				addActivity(`Task "${activeTaskData.title}" moved to ${newCategory}`);
				toast.success(`Task moved to ${newCategory}`);
			} catch (error) {
				console.error("Error moving task:", error);
				toast.error("Failed to move task");
			} finally {
				setLoading(false);
			}
		}
	};

	// Activity log
	const addActivity = (message) => {
		const activity = {
			id: Date.now(),
			message,
			timestamp: new Date().toISOString(),
			user: user?.displayName || user?.email || "Anonymous",
		};
		setActivities((prev) => [activity, ...prev]);
	};

	// Task handlers
	const handleAddTask = (category) => {
		setCurrentTask(null);
		setFormCategory(category);
		setIsFormOpen(true);
	};

	const handleEditTask = (task) => {
		setCurrentTask(task);
		setFormCategory(task.category);
		setIsFormOpen(true);
	};

	const handleDeleteTask = async (taskId) => {
		const taskToDelete = dashboardTasks?.find((t) => t._id === taskId);
		if (!taskToDelete) return false;

		try {
			setLoading(true);
			await axiosPublic.delete(`/task-delete/${taskId}`);
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
	};

	const handleFormSubmit = async (taskData) => {
		try {
			setLoading(true);

			if (currentTask) {
				await axiosPublic.patch(
					`/dashboard-tasks/${currentTask._id}?email=${user.email}`,
					taskData
				);
				addActivity(`Task "${taskData.title}" updated`);
				toast.success("Task updated successfully");
			} else {
				await axiosPublic.post(
					`/dashboard-tasks/${dashboardId}?email=${user.email}`,
					{ ...taskData, category: formCategory }
				);
				addActivity(`New task "${taskData.title}" created in ${formCategory}`);
				toast.success("Task created successfully");
			}
		} catch (err) {
			console.error("Error submitting task:", err);
			toast.error(`Failed to ${currentTask ? "update" : "create"} task`);
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
			const success = await updateDashboardName(dashboardId, boardName);
			if (success) {
				setDashboardInfo((prev) =>
					prev ? { ...prev, name: boardName } : null
				);
				addActivity(`Dashboard name changed to "${boardName}"`);
			} else if (dashboardInfo) {
				setBoardName(dashboardInfo.name);
			}
		} catch (error) {
			console.error("Error updating dashboard name:", error);
			toast.error("Failed to update dashboard name");
			if (dashboardInfo) {
				setBoardName(dashboardInfo.name);
			}
		} finally {
			setLoading(false);
			setShowNameEditor(false);
		}
	};

	// Persist customization
	useEffect(() => {
		localStorage.setItem("taskboardBannerColor", bannerColor);
	}, [bannerColor]);

	useEffect(() => {
		localStorage.setItem("taskboardName", boardName);
	}, [boardName]);

	if (loading) {
		return (
			<div className="h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
								title="Edit dashboard name"
							>
								<Edit2 size={16} className="text-white" />
							</button>
						</div>

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
							title="Manage team members"
						>
							<Users size={16} />
							Team Members
						</button>
						<button
							onClick={() => setShowActivityLog(!showActivityLog)}
							className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
							title="View activity log"
						>
							<Activity size={16} />
							Activity Log
						</button>
						<button
							onClick={() => setShowColorPicker(true)}
							className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
							title="Change banner color"
						>
							<Palette size={16} />
							Change Color
						</button>
					</div>
				</div>
				<div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
			</div>

			{/* Main Content */}
			<div className="flex-1 p-6">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCorners}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
						{categories.map((category) => (
							<SortableContext
								key={category}
								items={tasksByCategory[category]?.map((task) => task._id) || []}
								strategy={verticalListSortingStrategy}
							>
								<TaskColumn
									id={category}
									title={category}
									tasks={tasksByCategory[category] || []}
									onAddTask={handleAddTask}
									onDeleteTask={handleDeleteTask}
									onEditTask={handleEditTask}
								/>
							</SortableContext>
						))}
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
			</div>

			{/* Activity Log */}
			{showActivityLog && (
				<div className="fixed right-6 top-24 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50 border border-gray-200 dark:border-gray-700">
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-semibold">Activity Log</h3>
						<button
							onClick={() => setShowActivityLog(false)}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
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
						<div className="space-y-4">
							<div>
								<label className="block text-sm mb-2">
									Select a new color:
								</label>
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
						<div className="space-y-4">
							<div>
								<label className="block text-sm mb-2">Enter a new name:</label>
								<input
									type="text"
									value={boardName}
									onChange={(e) => setBoardName(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
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
			/>

			{/* Dashboard Info Bar */}
			<div className="p-4 bg-white dark:bg-gray-800 shadow-sm border-t border-gray-200 dark:border-gray-700">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<Menu className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
						<div>
							<h2 className="text-sm font-medium">
								{activeDashboard?.name || "Dashboard"}
							</h2>
							<div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
								<UserRound size={12} className="mr-1" />
								{activeDashboard?.members?.length || 1}{" "}
								{activeDashboard?.members?.length === 1 ? "member" : "members"}
							</div>
						</div>
					</div>
					<div className="text-xs text-gray-500 dark:text-gray-400">
						{dashboardTasks?.length || 0} tasks total
					</div>
				</div>
			</div>
		</div>
	);
};

export default TaskBoard;
