import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ToastContainer, toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import useAuth from "../hooks/useAuth";
import useAxiosPublic from "../hooks/useAxiosPublic";
import TaskManage from "./TaskManage";
import { useQueryClient } from "@tanstack/react-query";

const Task = () => {
	const axiosPublic = useAxiosPublic();
	const { user } = useAuth();
	const [open, setOpen] = useState(false);
	const [assignOpen, setAssignOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [taskId, setTaskId] = useState(1);
	const [image, setImage] = useState(null);
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState([]);
	
	const queryClient = useQueryClient();
	const [task, setTask] = useState({
		id: taskId,
		title: "",
		description: "",
		category: "To-Do",
		priority: "Medium",
		date: "",
		photo: "",
		assignedTo: [],
	});

	const image_host_key = import.meta.env.VITE_Image;
	const image_host_Api = `https://api.imgbb.com/1/upload?key=${image_host_key}`;

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await axiosPublic.get("/all-users");
				setUsers(response.data);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};
		fetchUsers();
	}, []);

	const handleChange = (e) => {
		setTask({ ...task, [e.target.name]: e.target.value });
	};

	const handleCategoryChange = (value) => {
		setTask({ ...task, category: value });
	};

	const handlePriorityChange = (value) => {
		setTask({ ...task, priority: value });
	};

	const handleImageChange = (e) => {
		setImage(e.target.files[0]);
	};

	const handleUserSelect = (user) => {
		setSelectedUsers((prev) => {
			const exists = prev.some((u) => u.id === user.id);
			return exists ? prev.filter((u) => u.id !== user.id) : [...prev, user];
		});
	};
	const handleAssignUser = (selectedUser) => {
		setTask((prevTask) => {
			const exists = prevTask.assignedTo.some(
				(u) => u.email === selectedUser.email
			);
			return {
				...prevTask,
				assignedTo: exists
					? prevTask.assignedTo.filter((u) => u.email !== selectedUser.email)
					: [...prevTask.assignedTo, selectedUser],
			};
		});
	};

	const handleSubmit = async () => {
		if (!task.title.trim()) {
			toast("Title is required!");
			return;
		}
	
		setLoading(true);
	
		let imageUrl = "";
		if (image) {
			const formData = new FormData();
			formData.append("image", image);
	
			try {
				const { data } = await axiosPublic.post(image_host_Api, formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
	
				if (data.success) {
					imageUrl = data.data.url;
				} else {
					toast("Image upload failed!");
					setLoading(false);
					return;
				}
			} catch (error) {
				console.error("Error uploading image:", error);
				toast("Image upload failed!");
				setLoading(false);
				return;
			}
		}
	
		const newTaskId = Date.now();
	
		const newTask = {
			...task,
			id: newTaskId,
			photo: imageUrl,
			timestamp: new Date(),
			userId: user?.uid,
			user: user?.displayName,
			email: user?.email,
			photoURL: user?.photoURL,
		};
	
		try {
			const response = await axiosPublic.post("/tasks", newTask);
			console.log("Task Created:", response.data);
			toast("Task created successfully!");
			queryClient.invalidateQueries(["tasks"]);
			setTaskId(newTaskId);
			setOpen(false);
			setTask({
				id: Date.now(),
				title: "",
				description: "",
				category: "To-Do",
				priority: "Medium",
				date: "",
				photo: "",
				assignedTo: [],
			});
			setImage(null);
		} catch (error) {
			console.error("Error creating task:", error);
			toast("Failed to create task!");
		}
	
		setLoading(false);
	};
	

	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Task</h1>
				<div className="flex items-center gap-3">
					<Button className="bg-blue-600" onClick={() => setOpen(true)}>
						+ Create Task
					</Button>
				</div>

				{/* Modal */}
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Task</DialogTitle>
						</DialogHeader>

						<Label>Title</Label>
						<Input
							name="title"
							placeholder="Task Title"
							maxLength={50}
							value={task.title}
							onChange={handleChange}
							className="rounded-md"
						/>

						<Label>Description</Label>
						<Textarea
							name="description"
							placeholder="Task Description (Optional)"
							maxLength={200}
							value={task.description}
							onChange={handleChange}
						/>

						<div className="flex gap-2">
							<div className="w-full">
								<Label>Task Date</Label>
								<Input
									type="date"
									name="date"
									value={task.date}
									onChange={handleChange}
									className="rounded-md "
								/>
							</div>

							<div className="w-full">
								<Label>Category</Label>
								<Select
									value={task.category}
									onValueChange={handleCategoryChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select Category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="To-Do">To-Do</SelectItem>
										<SelectItem value="In Progress">In Progress</SelectItem>
										<SelectItem value="Done">Done</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="flex gap-2 items-center">
							<div className="w-full">
								<Label>Priority Level</Label>
								<Select
									value={task.priority}
									onValueChange={handlePriorityChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select Priority" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Low">Low</SelectItem>
										<SelectItem value="Medium">Medium</SelectItem>
										<SelectItem value="High">High</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="w-full flex flex-col gap-1 mt-1">
								<Label>Assign To</Label>
								<Button
									onClick={() => setAssignOpen(true)}
									className="bg-blue-400 relative"
								>
									{task.assignedTo.length > 0
										? task.assignedTo.map((u) => u.name).join(", ")
										: "Select Users"}
								</Button>
							</div>
						</div>
						<Label>Upload Image</Label>
						<Input
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							className="rounded-lg"
						/>

						<DialogFooter>
							<Button onClick={handleSubmit} disabled={loading}>
								{loading ? "Creating..." : "Create"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Assign User Modal */}
			<Dialog open={assignOpen} className="absolute" onOpenChange={setAssignOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Assign Task to Users</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col  overflow-y-auto">
						{users.map((user) => {
							const isSelected = task.assignedTo.some(
								(u) => u.email === user.email
							);
							return (
								<div
									key={user.email}
									className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
										isSelected
											? ""
											: "bg-white border-gray-200 hover:bg-gray-50"
									}`}
									onClick={() => handleAssignUser(user)}
								>
									<div className="flex items-center gap-3">
										<img
											src={user.photoURL}
											alt={user.displayName}
											className="w-8 h-8 rounded-full"
										/>
										<div>
											<p className="font-medium text-sm">{user.displayName}</p>
											<p className="text-xs text-gray-500">{user.email}</p>
										</div>
									</div>
									{isSelected && (
										<div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
											<svg
												className="w-3 h-3 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</DialogContent>
			</Dialog>
			<TaskManage />
			<ToastContainer />
		</>
	);
};

export default Task;
