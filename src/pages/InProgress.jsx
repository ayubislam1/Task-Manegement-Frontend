import React, { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash } from "lucide-react";
import { useTask } from "../hooks/useTask";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { toast, ToastContainer } from "react-toastify";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const InProgress = () => {
	const { tasks, isLoading, deleteTask, updateTask } = useTask();
	const [showTooltip, setShowTooltip] = useState(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedTaskId, setSelectedTaskId] = useState(null);
	const [loadingTasks, setLoadingTasks] = useState({});

	const inProgress = tasks.filter((task) => task.category === "In Progress");

	const handleDelete = async (e, id) => {
		e.preventDefault();
		e.stopPropagation();
		if (!id || loadingTasks[id]) return;

		setLoadingTasks((prev) => ({ ...prev, [id]: true }));
		try {
			const success = await deleteTask(id);
			if (success) {
				toast.success("Task deleted successfully!");
			}
		} catch (error) {
			console.error("Delete error:", error);
			toast.error(error.message || "Failed to delete task");
		} finally {
			setLoadingTasks((prev) => ({ ...prev, [id]: false }));
		}
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		if (!selectedTaskId || loadingTasks[selectedTaskId]) return;

		setLoadingTasks((prev) => ({ ...prev, [selectedTaskId]: true }));
		try {
			const success = await updateTask(selectedTaskId, formData);
			if (success) {
				setShowEditModal(false);
				toast.success("Task updated successfully!");
			}
		} catch (error) {
			console.error("Error updating task:", error);
			toast.error(error.message || "Failed to update task");
		} finally {
			setLoadingTasks((prev) => ({ ...prev, [selectedTaskId]: false }));
		}
	};

	const handleEdit = (e, id) => {
		e.preventDefault();
		e.stopPropagation();
		const taskToEdit = inProgress.find((task) => task._id === id);
		if (taskToEdit) {
			setFormData({
				...taskToEdit,
				timestamp: format(new Date(taskToEdit.timestamp), "yyyy-MM-dd"),
			});
			setSelectedTaskId(id);
			setShowEditModal(true);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-4rem)]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="">
			<h2 className="text-xl font-semibold mb-4 ">In Progress Tasks</h2>
			<Table className="rounded-t-lg shadow-md overflow-x-hidden z-10 ">
				<TableHeader>
					<TableRow className="bg-blue-400 hover:bg-blue-400">
						<TableHead className="text-black">Title</TableHead>
						<TableHead className="text-black">Description</TableHead>
						<TableHead className="text-black">Priority</TableHead>
						<TableHead className="text-black">Assigned To</TableHead>
						<TableHead className="text-black">Date</TableHead>
						<TableHead className="text-black">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className="bg-white">
					{inProgress.length > 0 ? (
						inProgress.map((task) => (
							<TableRow key={task._id}>
								<TableCell>{task.title}</TableCell>
								<TableCell>{task.description}</TableCell>
								<TableCell>{task.priority}</TableCell>
								<TableCell>
									<div className="flex -space-x-3">
										{task.assignedTo &&
										Array.isArray(task.assignedTo) &&
										task.assignedTo.length > 0 ? (
											task.assignedTo.map((user) => (
												<div
													key={user._id}
													className="relative group cursor-pointer"
													onMouseEnter={() =>
														setShowTooltip(`${task._id}-${user._id}`)
													}
													onMouseLeave={() => setShowTooltip(null)}
												>
													<Avatar className="border-2 border-white">
														<AvatarImage
															src={user?.photoURL || ""}
															alt={user?.name || "User"}
														/>
														<AvatarFallback>
															{user?.name ? user.name[0] : "?"}
														</AvatarFallback>
													</Avatar>

													{/* Tooltip */}
													{showTooltip == `${task._id}-${user._id}` && (
														<div className="absolute   w-56 left-1/2 transform -translate-x-1/2 mb-2 bg-white shadow-lg rounded-lg p-3 border border-gray-200 z-[9999]">
															<div className="flex gap-2 items-center">
																<Avatar className="border-white">
																	<AvatarImage
																		src={user?.photoURL || ""}
																		alt={user?.name || "User"}
																	/>
																	<AvatarFallback>
																		{user?.name ? user.name[0] : "?"}
																	</AvatarFallback>
																</Avatar>
																<div>
																	<p className="font-semibold text-gray-900">
																		{user?.name || "Unknown User"}
																	</p>
																	<p className="text-base">{user?.role}</p>
																	<p className="text-xs text-gray-500">
																		{user?.email || "No email"}
																	</p>
																</div>
															</div>
														</div>
													)}
												</div>
											))
										) : (
											<span className="text-gray-500">Unassigned</span>
										)}
									</div>
								</TableCell>

								<TableCell>{task.date}</TableCell>
								<TableCell className="space-x-2">
									<Button
										size="sm"
										variant="ghost"
										onClick={(e) => handleEdit(e, task._id)}
										disabled={loadingTasks[task._id]}
										className="bg-white border relative"
									>
										{loadingTasks[task._id] ? (
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
											</div>
										) : (
											<Pencil className="w-4 h-4 text-green-400" />
										)}
									</Button>
									<Button
										size="sm"
										variant="destructive"
										onClick={(e) => handleDelete(e, task._id)}
										disabled={loadingTasks[task._id]}
										className="relative"
									>
										{loadingTasks[task._id] ? (
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
											</div>
										) : (
											<Trash className="w-4 h-4" />
										)}
									</Button>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={6} className="text-center text-gray-500">
								No tasks available
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{showEditModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] ">
					<div className="bg-white p-6 rounded-lg w-full max-w-md">
						<h3 className="text-lg font-semibold mb-4">Edit Task</h3>
						<form onSubmit={handleEditSubmit}>
							<div className="space-y-4">
								<div>
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										name="title"
										value={formData.title}
										onChange={handleInputChange}
										className="rounded-md"
									/>
								</div>

								<div>
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										name="description"
										value={formData.description}
										onChange={handleInputChange}
									/>
								</div>

								<div className="flex gap-2 items-center">
									<div className="w-full">
										<Label htmlFor="category">Category</Label>
										<select
											id="category"
											name="category"
											value={formData.category}
											onChange={handleInputChange}
											className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										>
											<option value="To-Do">To-Do</option>
											<option value="In Progress">In Progress</option>
											<option value="Done">Done</option>
										</select>
									</div>

									<div className="w-full">
										<Label htmlFor="priority">Priority</Label>
										<select
											id="priority"
											name="priority"
											value={formData.priority}
											onChange={handleInputChange}
											className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										>
											<option value="High">High</option>
											<option value="Medium">Medium</option>
											<option value="Low">Low</option>
										</select>
									</div>
								</div>
								<div>
									<Label htmlFor="timestamp">Due Date</Label>
									<Input
										type="date"
										id="timestamp"
										name="timestamp"
										value={formData.timestamp}
										onChange={handleInputChange}
										className="rounded-md"
									/>
								</div>
							</div>

							<div className="mt-6 flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowEditModal(false)}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={loadingTasks[selectedTaskId]}
									className="relative"
								>
									{loadingTasks[selectedTaskId] ? (
										<>
											<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
			<ToastContainer></ToastContainer>
		</div>
	);
};

export default InProgress;
