import React, { useState } from "react";

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

const Task = () => {
	const axiosPublic = useAxiosPublic();
	const { user } = useAuth();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [task, setTask] = useState({
		title: "",
		description: "",
		category: "To-Do",
		priority: "Medium",
		date: "",
	});

	const handleChange = (e) => {
		setTask({ ...task, [e.target.name]: e.target.value });
	};

	const handleCategoryChange = (value) => {
		setTask({ ...task, category: value });
	};

	const handlePriorityChange = (value) => {
		setTask({ ...task, priority: value });
	};

	const handleSubmit = async () => {
		if (!task.title.trim()) {
			alert("Title is required!");
			return;
		}

		const newTask = {
			...task,
			timestamp: new Date(),
			userId: user?.uid,
			user: user?.displayName,
			email: user?.email,
			photo: user?.photoURL,
		};

		setLoading(true);
		try {
			const response = await axiosPublic.post("/tasks", newTask);
			console.log("Task Created:", response.data);
			toast("Task created successfully!");

			setOpen(false);
			setTask({
				title: "",
				description: "",
				category: "To-Do",
				priority: "Medium",
				date: "",
			});
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

						<div className="flex justify-evenly items-center gap-2">
							<div className="w-full">
								<Label>Task Date</Label>
								<Input
									type="date"
									name="date"
									value={task.date}
									onChange={handleChange}
									className="rounded-md"
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

						<Label>Priority Level</Label>
						<Select value={task.priority} onValueChange={handlePriorityChange}>
							<SelectTrigger>
								<SelectValue placeholder="Select Priority" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Low">Low</SelectItem>
								<SelectItem value="Medium">Medium</SelectItem>
								<SelectItem value="High">High</SelectItem>
							</SelectContent>
						</Select>

						<DialogFooter>
							<Button onClick={handleSubmit} disabled={loading}>
								{loading ? "Creating..." : "Create"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
			<ToastContainer></ToastContainer>
		</>
	);
};

export default Task;
