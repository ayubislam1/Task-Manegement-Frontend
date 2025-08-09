import React, { useEffect, useState } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
	joinTaskRoom,
	leaveTaskRoom,
	socket,
	getActiveTaskUsers,
} from "../socket/socket";
import { Badge } from "../components/ui/badge";
import { useTask } from "../hooks/useTask";
import { useAuth } from "../hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tooltip } from "../components/ui/tooltip";
import { Button } from "../components/ui/button";
import {
	Edit,
	Trash2,
	AlertCircle,
	Calendar,
	Clock,
	Link,
	Unlink2,
	Users,
	AlertTriangle,
	X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";

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

const getStatusColor = (status) => {
	switch (status?.toLowerCase()) {
		case "to-do":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
		case "in progress":
			return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
		case "done":
			return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
	}
};

const TaskDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const axiosPublic = useAxiosPublic();
	const [task, setTask] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { tasks, updateTaskStatus, addTaskDependency, removeTaskDependency } =
		useTask();
	const { user } = useAuth();
	const [activeUsers, setActiveUsers] = useState([]);
	const [isTaskOwner, setIsTaskOwner] = useState(false);
	const [isAssignedToCurrentUser, setIsAssignedToCurrentUser] = useState(false);
	const [showAddDependencyModal, setShowAddDependencyModal] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredTasks, setFilteredTasks] = useState([]);

	useEffect(() => {
		const fetchTask = async () => {
			try {
				const res = await axiosPublic.get(`/tasks/${id}`);
				setTask(res.data[0]);
				setError(null);
				joinTaskRoom(id);
			} catch (err) {
				setError("Failed to load task details");
				toast.error("Failed to load task details");
			} finally {
				setLoading(false);
			}
		};

		fetchTask();

		return () => {
			leaveTaskRoom(id);
		};
	}, [axiosPublic, id]);

	// Keep task details in sync with global tasks state
	useEffect(() => {
		const currentTask = tasks.find((t) => t._id === id);
		if (currentTask && task) {
			setTask((prev) => ({
				...prev,
				...currentTask,
			}));
		}
	}, [tasks, id, task]);

	// Check if current user is task owner or assignee
	useEffect(() => {
		if (task && user) {
			// Check if current user created the task
			setIsTaskOwner(task.createdBy === user.uid);

			// Check if task is assigned to current user
			const isAssigned = task.assignedTo?.some(
				(assignee) => assignee.email === user.email || assignee._id === user.uid
			);
			setIsAssignedToCurrentUser(isAssigned);
		}
	}, [task, user]);

	// Real-time collaboration indicators
	useEffect(() => {
		// Set up listeners for active users
		const handleUserJoined = ({ taskId, user }) => {
			if (taskId === id) {
				setActiveUsers(getActiveTaskUsers(id));
			}
		};

		const handleUserLeft = ({ taskId, userId }) => {
			if (taskId === id) {
				setActiveUsers(getActiveTaskUsers(id));
			}
		};

		const handleActiveUsers = ({ taskId, users }) => {
			if (taskId === id) {
				setActiveUsers(users);
			}
		};

		// Register socket listeners
		socket.on("user_joined_task", handleUserJoined);
		socket.on("user_left_task", handleUserLeft);
		socket.on("active_task_users", handleActiveUsers);

		// Update active users every 5 seconds
		const interval = setInterval(() => {
			setActiveUsers(getActiveTaskUsers(id));
		}, 5000);

		return () => {
			socket.off("user_joined_task", handleUserJoined);
			socket.off("user_left_task", handleUserLeft);
			socket.off("active_task_users", handleActiveUsers);
			clearInterval(interval);
		};
	}, [id]);

	// Filter tasks for dependency selection
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredTasks([]);
			return;
		}

		const filtered = tasks.filter(
			(t) =>
				// Don't include the current task
				t._id !== id &&
				// Don't include tasks that are already dependencies
				!task?.dependencies?.includes(t._id) &&
				// Match by title
				t.title.toLowerCase().includes(searchQuery.toLowerCase())
		);

		setFilteredTasks(filtered);
	}, [searchQuery, tasks, id, task]);

	const handleStatusChange = async (newStatus) => {
		if (task?.category === newStatus) return;
		setLoading(true);
		try {
			await updateTaskStatus(task._id, newStatus, task.category);
			toast.success(`Task moved to ${newStatus}`);

			// Update local state for immediate UI feedback
			setTask((prev) => ({
				...prev,
				category: newStatus,
			}));
		} catch (error) {
			console.error("Error updating status:", error);
			toast.error("Failed to update task status");
		} finally {
			setLoading(false);
		}
	};

	const handleEditTask = () => {
		navigate(`/dashboard/task-edit/${id}`);
	};

	const handleAddDependency = async (dependencyId) => {
		try {
			await addTaskDependency(task._id, dependencyId);
			toast.success("Dependency added successfully");
			setSearchQuery("");
			setShowAddDependencyModal(false);
		} catch (error) {
			console.error("Error adding dependency:", error);
			toast.error("Failed to add dependency");
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-[50vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-[50vh]">
				<p className="text-red-500 text-lg">{error}</p>
				<button
					onClick={() => window.location.reload()}
					className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
				>
					Retry
				</button>
			</div>
		);
	}

	if (!task) {
		return (
			<div className="flex justify-center items-center h-[50vh]">
				<p className="text-lg">Task not found</p>
			</div>
		);
	}

	// Filter out current user from active users
	const otherActiveUsers = activeUsers.filter((u) => u.id !== user?.uid);

	// Format date for better display
	const formattedDueDate = task.dueDate
		? new Date(task.dueDate).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
		  })
		: "No due date";

	const timeRemaining = task.dueDate
		? formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })
		: "";
	const isPastDue =
		task.dueDate &&
		new Date(task.dueDate) < new Date() &&
		task.category !== "Done";

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
				<div className="flex justify-between items-start mb-6">
					<div className="flex items-start gap-4">
						<div>
							<h1 className="text-2xl font-semibold mb-2">{task.title}</h1>
							<div className="flex flex-wrap gap-2">
								<Badge className={getStatusColor(task.category)}>
									{task.category}
								</Badge>
								<Badge className={getPriorityColor(task.priority)}>
									{task.priority}
								</Badge>
								{isPastDue && (
									<Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
										<AlertCircle className="w-3 h-3" /> Overdue
									</Badge>
								)}
							</div>
						</div>
					</div>

					{(isTaskOwner || isAssignedToCurrentUser) && (
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={handleEditTask}>
								<Edit className="w-4 h-4 mr-1" /> Edit
							</Button>
						</div>
					)}
				</div>

				{/* Time information */}
				<div className="flex gap-6 mb-6">
					<div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
						<Calendar className="w-4 h-4" />
						<span>{formattedDueDate}</span>
					</div>
					{timeRemaining && (
						<div
							className={`flex items-center gap-2 ${
								isPastDue ? "text-red-500" : "text-gray-600 dark:text-gray-400"
							}`}
						>
							<Clock className="w-4 h-4" />
							<span>{timeRemaining}</span>
						</div>
					)}
				</div>

				{/* Assignees section */}
				<div className="mb-6">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
						Assigned to
					</h3>
					<div className="flex flex-wrap gap-2">
						{task.assignedTo && task.assignedTo.length > 0 ? (
							task.assignedTo.map((assignee) => (
								<div
									key={assignee._id}
									className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"
								>
									<Avatar className="w-6 h-6">
										<AvatarImage src={assignee.photoURL} alt={assignee.name} />
										<AvatarFallback>{assignee.name?.charAt(0)}</AvatarFallback>
									</Avatar>
									<span className="text-sm">{assignee.name}</span>
								</div>
							))
						) : (
							<span className="text-gray-500 dark:text-gray-400">
								Unassigned
							</span>
						)}
					</div>
				</div>

				{/* Real-time collaboration indicator */}
				{otherActiveUsers.length > 0 && (
					<div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center">
						<div className="mr-3 text-blue-600 dark:text-blue-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="lucide lucide-users"
							>
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
								<circle cx="9" cy="7" r="4"></circle>
								<path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
								<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
							</svg>
						</div>
						<div className="flex-1">
							<p className="text-sm text-blue-800 dark:text-blue-300">
								{otherActiveUsers.length === 1
									? `${otherActiveUsers[0].name} is currently viewing this task`
									: `${otherActiveUsers.length} team members are currently viewing this task`}
							</p>
						</div>
						<div className="flex -space-x-2">
							{otherActiveUsers.slice(0, 3).map((user) => (
								<Tooltip key={user.id}>
									<Avatar className="border-2 border-white dark:border-gray-800 w-8 h-8">
										<AvatarImage src={user.photoURL} alt={user.name} />
										<AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
									</Avatar>
									<div className="tooltip-content">{user.name}</div>
								</Tooltip>
							))}
							{otherActiveUsers.length > 3 && (
								<div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs border-2 border-white dark:border-gray-800">
									+{otherActiveUsers.length - 3}
								</div>
							)}
						</div>
					</div>
				)}

				{/* Task description */}
				<div className="mb-6">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
						Description
					</h3>
					<div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
						{task.description ? (
							<p className="text-gray-700 dark:text-gray-300">
								{task.description}
							</p>
						) : (
							<p className="text-gray-400 dark:text-gray-500 italic">
								No description provided
							</p>
						)}
					</div>
				</div>

				{/* Task Dependencies */}
				<div className="mb-6">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
						Dependencies
					</h3>
					<div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
						{task.dependencies && task.dependencies.length > 0 ? (
							<div className="space-y-3">
								<h4 className="text-sm font-medium">This task depends on:</h4>
								<div className="grid gap-2">
									{task.dependencies.map((depId) => {
										const dependencyTask = tasks.find((t) => t._id === depId);
										return dependencyTask ? (
											<div
												key={depId}
												className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
												onClick={() => navigate(`/dashboard/task/${depId}`)}
												role="button"
											>
												<div className="flex items-center gap-2">
													<Badge
														className={getStatusColor(dependencyTask.category)}
													>
														{dependencyTask.category}
													</Badge>
													<span>{dependencyTask.title}</span>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={(e) => {
														e.stopPropagation();
														// Confirm before removing dependency
														if (window.confirm("Remove this dependency?")) {
															removeTaskDependency(task._id, depId);
														}
													}}
													className="opacity-0 group-hover:opacity-100"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="16"
														height="16"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
														className="lucide lucide-unlink-2"
													>
														<path d="m15 7 2 2" />
														<path d="M9 17a2 2 0 1 1 2-2" />
														<path d="m19 19-2-2" />
														<path d="M15 15h-2" />
														<path d="M13 13v-2" />
														<path d="M3 3 l18 18" />
													</svg>
												</Button>
											</div>
										) : null;
									})}
								</div>
							</div>
						) : (
							<p className="text-gray-400 dark:text-gray-500 italic">
								No dependencies
							</p>
						)}

						{/* Add dependency button */}
						{(isTaskOwner || isAssignedToCurrentUser) && (
							<div className="mt-4">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowAddDependencyModal(true)}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="lucide lucide-link mr-1"
									>
										<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
										<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
									</svg>
									Add Dependency
								</Button>
							</div>
						)}
					</div>
				</div>

				{/* Dependent Tasks (reverse dependencies) */}
				<div className="mb-6">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
						Dependent Tasks
					</h3>
					<div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
						{tasks.some((t) => t.dependencies?.includes(task._id)) ? (
							<div className="space-y-3">
								<h4 className="text-sm font-medium">
									Tasks that depend on this:
								</h4>
								<div className="grid gap-2">
									{tasks
										.filter((t) => t.dependencies?.includes(task._id))
										.map((dependentTask) => (
											<div
												key={dependentTask._id}
												className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
												onClick={() =>
													navigate(`/dashboard/task/${dependentTask._id}`)
												}
												role="button"
											>
												<Badge
													className={getStatusColor(dependentTask.category)}
												>
													{dependentTask.category}
												</Badge>
												<span>{dependentTask.title}</span>
											</div>
										))}
								</div>
							</div>
						) : (
							<p className="text-gray-400 dark:text-gray-500 italic">
								No tasks depend on this task
							</p>
						)}
					</div>
				</div>

				{/* Status change buttons */}
				<div className="mt-8">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
						Change Status
					</h3>
					<div className="flex flex-wrap gap-3">
						{["To-Do", "In Progress", "Done"].map((status) => (
							<button
								key={status}
								onClick={() => handleStatusChange(status)}
								disabled={loading || task.category === status}
								className={`px-4 py-2 rounded-lg transition duration-200 ${
									task.category === status
										? "bg-primary text-white"
										: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
								} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								{status}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Add Dependency Modal */}
			<Dialog
				open={showAddDependencyModal}
				onOpenChange={setShowAddDependencyModal}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Add Task Dependency</DialogTitle>
						<DialogDescription>
							Select a task that this task depends on.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-2">
						<div className="space-y-2">
							<Input
								type="text"
								placeholder="Search tasks by title..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full"
							/>
						</div>

						<div className="max-h-60 overflow-y-auto">
							{filteredTasks.length > 0 ? (
								<div className="space-y-1">
									{filteredTasks.map((t) => (
										<div
											key={t._id}
											onClick={() => handleAddDependency(t._id)}
											className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer"
										>
											<div className="flex items-center gap-2">
												<Badge className={getStatusColor(t.category)}>
													{t.category}
												</Badge>
												<span className="font-medium">{t.title}</span>
											</div>
											<Button size="sm" variant="ghost">
												<Link className="w-4 h-4" />
											</Button>
										</div>
									))}
								</div>
							) : searchQuery ? (
								<p className="text-center py-6 text-gray-500 dark:text-gray-400">
									No matching tasks found
								</p>
							) : (
								<p className="text-center py-6 text-gray-500 dark:text-gray-400">
									Type to search for tasks
								</p>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default TaskDetails;
