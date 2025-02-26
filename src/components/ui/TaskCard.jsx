import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
	Flag,
	MoreVertical,
	Eye,
	Edit,
	Trash,
	MessageCircle,
	Link,
} from "lucide-react";
import { useNavigate } from "react-router";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { toast } from "react-toastify";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TaskCard = ({ task, onDelete, onEdit }) => {
	const [showMenu, setShowMenu] = useState(false);
	const [showTooltip, setShowTooltip] = useState(null);
	const menuRef = useRef(null);
	const assignedUsers = task.assignedTo;
	const navigate = useNavigate();
	const axiosPublic = useAxiosPublic();
	console.log(task);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const [formData, setFormData] = useState({
		title: task.title,
		description: task.description,
		category: task.category,
		priority: task.priority,
		timestamp: format(new Date(task.timestamp), "yyyy-MM-dd"),
	});
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMenu(false);
				setShowEditModal(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleEditSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await axiosPublic.patch(
				`/task-update/${task._id}`,
				formData
			);
			if (response.data.modifiedCount > 0) {
				toast.success("Task updated successfully!");
				onEdit(task._id, formData);
				setShowEditModal(false);
			}
		} catch (error) {
			toast.error("Failed to update task");
			console.error(error);
		}
	};

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleDelete = (id) => {
		axiosPublic.delete(`/task-delete/${id}`).then((res) => {
			if (res.data.deletedCount > 0) {
				toast("Task deleted Successfully!");
				onDelete(id);
				setShowDeleteModal(false);
			}
		});
	};

	const onOpen = (id) => {
		navigate(`/dashboard/task-details/${id}`);
	};

	return (
		<>
			<Card className="py-4  rounded-2xl border border-gray-300 w-full max-w-md bg-white transition-transform hover:scale-[1.01] shadow-md relative ">
				<CardContent className="space-y-4">
					{/* Task Image */}
					{task.photo && (
						<div className="w-full h-40 rounded-xl overflow-hidden">
							<img
								src={task.photo || ""}
								alt={task.title}
								className="w-full h-full object-cover"
							/>
						</div>
					)}

					{/* Task Title & Category */}
					<div className="space-y-2">
						<h3 className="text-base font-semibold text-gray-900">
							{task.title}
						</h3>
						<Badge className="text-sm font-medium bg-blue-500 text-white px-2 py-1 rounded-lg">
							{task.category}
						</Badge>
					</div>

					{/* Three-Dot Menu */}
					<div className="absolute -top-1 right-0" ref={menuRef}>
						<button
							className="p-2 rounded-full "
							onClick={() => setShowMenu(!showMenu)}
						>
							<MoreVertical className="w-5 h-5 text-gray-600" />
						</button>

						{showMenu && (
							<div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border border-gray-200 z-10">
								<button
									className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
									onClick={() => {
										onOpen(task._id);

										setShowMenu(false);
									}}
								>
									<Eye className="w-4 h-4 mr-2 text-blue-500" />
									Open Task
								</button>
								<button
									className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
									onClick={() => {
										setShowEditModal(!showEditModal);
										setShowMenu(false);
									}}
								>
									<Edit className="w-4 h-4 mr-2 text-green-500" />
									Edit
								</button>
								<button
									className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
									onClick={() => {
										setShowDeleteModal(true);
										setShowMenu(false);
									}}
								>
									<Trash className="w-4 h-4 mr-2" />
									Delete
								</button>
							</div>
						)}
					</div>

					<p className="text-sm text-gray-600 leading-relaxed">
						{task.description}
					</p>

					<div className="flex items-center justify-between text-sm text-gray-500">
						<div className="flex items-center space-x-2">
							<Flag className="h-4 w-4 text-red-500" />
							<span className="font-medium text-red-500">{task.priority}</span>
						</div>
						<span>{format(new Date(task?.timestamp), "MMM dd, yyyy")}</span>
					</div>

					{/* User Info with Avatars and Icons */}
					<div className="flex items-center justify-between mt-4">
						{/* Left Side: Comment and Link Icon */}

						<div className="flex -space-x-3">
							{assignedUsers?.map((user, index) => (
								<div
									key={index}
									className="relative group cursor-pointer "
									onMouseEnter={() => setShowTooltip(index)}
									onMouseLeave={() => setShowTooltip(null)}
								>
									<Avatar className="border-2 border-white">
										<AvatarImage
											src={user?.photoURL || ""}
											alt={user?.name || "User"}
										/>

										<AvatarFallback>
											{user?.name ? user.name : "?"}
										</AvatarFallback>
									</Avatar>
									{/* Tooltip */}
									{showTooltip === index && (
										<div className="absolute  bottom-full w-56 left-1/2 transform -translate-x-1/2 mb-2 bg-white shadow-lg rounded-lg p-3 border border-gray-200  z-[9999]">
											<div className="flex gap-2 items-center">
												<div>
													<Avatar className=" border-white">
														<AvatarImage
															src={user?.photoURL || ""}
															alt={user?.name || "User"}
														/>

														<AvatarFallback>
															{user?.name ? user.name : "?"}
														</AvatarFallback>
													</Avatar>
												</div>
												<div>
													{" "}
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
							))}
						</div>
						{/* Right Side: Multiple Avatars */}

						<div className="flex items-center space-x-3">
							<MessageCircle className="h-5 w-5 text-gray-600 cursor-pointer" />
							<Link className="h-5 w-5 text-gray-600 cursor-pointer" />
						</div>
					</div>
				</CardContent>
			</Card>
			{/* Edit Modal */}
			{showEditModal && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] "
					ref={menuRef}
				>
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
								<Button type="submit">Save Changes</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{showDeleteModal && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
					ref={menuRef}
				>
					<div className="bg-white p-6 rounded-lg w-full max-w-md">
						<h3 className="text-lg font-semibold mb-4">Delete Task</h3>
						<p className="mb-4">
							Are you sure you want to delete this task? This action cannot be
							undone.
						</p>
						<div className="mt-6 flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowDeleteModal(false)}
							>
								Cancel
							</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={() => handleDelete(task._id)}
							>
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default TaskCard;
