"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useUsers } from "../hooks/useUsers";
import { Search, X, Mail, Plus, User, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../context/DashboardContext";
import useAxiosPublic from "../hooks/useAxiosPublic";

const TaskForm = ({
	isOpen,
	onClose,
	onSubmit,
	initialData = null,
	columnId = "To-Do",
}) => {
	const { users } = useUsers();
	const { user } = useAuth();
	const { activeDashboard } = useDashboard();
	const axiosPublic = useAxiosPublic();
	const [selectedAssignees, setSelectedAssignees] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [quickAssign, setQuickAssign] = useState(false);
	const [showInviteForm, setShowInviteForm] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteLoading, setInviteLoading] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			title: "",
			description: "",
			priority: "Medium",
			dueDate: format(new Date(), "yyyy-MM-dd"),
			category: columnId,
			assignedTo: [],
		},
	});

	const currentCategory = watch("category");
	const currentTitle = watch("title");
	const currentDescription = watch("description");
	const currentPriority = watch("priority");

	useEffect(() => {
		if (initialData) {
			Object.keys(initialData).forEach((key) => {
				if (key === "dueDate" && initialData[key]) {
					setValue(key, format(new Date(initialData[key]), "yyyy-MM-dd"));
				} else if (key === "assignedTo") {
					setSelectedAssignees(initialData[key] || []);
					setValue(key, initialData[key] || []);
				} else {
					setValue(key, initialData[key]);
				}
			});
		} else {
			reset({
				title: "",
				description: "",
				priority: "Medium",
				dueDate: format(new Date(), "yyyy-MM-dd"),
				category: columnId,
				assignedTo: [],
			});
			setSelectedAssignees([]);
		}
	}, [initialData, columnId, setValue, reset]);

	const handleFormSubmit = async (data) => {
		try {
			// Remove _id field if it exists to prevent MongoDB errors
			const { _id, ...cleanData } = data;

			const formData = {
				...cleanData,
				assignedTo: selectedAssignees.map(({ _id, name, email, photoURL }) => ({
					_id,
					name,
					email,
					photoURL,
				})),
				category: data.category || columnId,
				// Ensure dates are properly formatted
				dueDate: new Date(data.dueDate).toISOString(),
				createdAt: initialData?.createdAt || new Date().toISOString(),
			};

			await onSubmit(formData);
			toast.success(
				initialData
					? "Task updated successfully!"
					: "Task created successfully!"
			);
			reset();
			onClose();
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error(error.message || "Failed to save task. Please try again.");
		}
	};

	const toggleAssignee = (user) => {
		setSelectedAssignees((prev) => {
			const isSelected = prev.some((u) => u._id === user._id);
			if (isSelected) {
				return prev.filter((u) => u._id !== user._id);
			} else {
				return [...prev, user];
			}
		});
	};

	const removeAssignee = (userId) => {
		setSelectedAssignees((prev) => prev.filter((u) => u._id !== userId));
	};

	const assignToAnyone = () => {
		const anyoneUser = {
			_id: "anyone",
			name: "Anyone",
			email: "anyone@example.com",
			photoURL: "",
		};

		// Check if 'Anyone' is already assigned
		if (!selectedAssignees.some((u) => u._id === "anyone")) {
			setSelectedAssignees([anyoneUser]);
		}
	};

	// Handle team member invitation
	const handleInviteMember = async () => {
		if (!inviteEmail.trim() || !activeDashboard) {
			toast.error("Please enter a valid email address");
			return;
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(inviteEmail)) {
			toast.error("Please enter a valid email address");
			return;
		}

		setInviteLoading(true);
		try {
			const inviteData = {
				dashboardId: activeDashboard._id,
				invitedBy: {
					uid: user.uid,
					email: user.email,
					name: user.displayName || user.email,
					photoURL: user.photoURL,
				},
				invitedEmail: inviteEmail.trim(),
				dashboardName: activeDashboard.name,
			};

			await axiosPublic.post('/invite', inviteData);
			toast.success(`Invitation sent to ${inviteEmail}`);
			setInviteEmail("");
			setShowInviteForm(false);
		} catch (error) {
			console.error("Error sending invitation:", error);
			const errorMessage = error.response?.data?.message || "Failed to send invitation";
			toast.error(errorMessage);
		} finally {
			setInviteLoading(false);
		}
	};

	const filteredUsers = users?.filter(
		(user) =>
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.email.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Determine priority badge color
	const getPriorityColor = (priority) => {
		switch (priority) {
			case "High":
				return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
			case "Medium":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
			case "Low":
				return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
			default:
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">
						{initialData ? "Edit Task" : "Create New Task"}
					</DialogTitle>
					<DialogDescription>
						{initialData
							? "Update the details of this task."
							: "Fill out the details to create a new task."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
					{/* Title */}
					<div>
						<Label htmlFor="title" className="text-sm font-medium">
							Task Title
						</Label>
						<Input
							id="title"
							placeholder="Enter task title..."
							{...register("title", { required: "Title is required" })}
							className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						/>
						{errors.title && (
							<p className="text-sm text-red-500 mt-1">
								{errors.title.message}
							</p>
						)}
					</div>

					{/* Description */}
					<div>
						<Label htmlFor="description" className="text-sm font-medium">
							Description
						</Label>
						<Textarea
							id="description"
							placeholder="Enter task details..."
							{...register("description")}
							className="mt-1.5 min-h-24 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>

					{/* Category */}
					<div>
						<Label htmlFor="category" className="text-sm font-medium">
							Status
						</Label>
						<Select
							value={currentCategory}
							onValueChange={(value) => setValue("category", value)}
						>
							<SelectTrigger className="mt-1.5 border-gray-300">
								<SelectValue placeholder="Select category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="To-Do">To-Do</SelectItem>
								<SelectItem value="In Progress">In Progress</SelectItem>
								<SelectItem value="Done">Done</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Priority and Due Date */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="priority" className="text-sm font-medium">
								Priority
							</Label>
							<Select
								value={watch("priority")}
								onValueChange={(value) => setValue("priority", value)}
							>
								<SelectTrigger className="mt-1.5 border-gray-300">
									<SelectValue placeholder="Select priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="High">
										<div className="flex items-center">
											<span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
											High
										</div>
									</SelectItem>
									<SelectItem value="Medium">
										<div className="flex items-center">
											<span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
											Medium
										</div>
									</SelectItem>
									<SelectItem value="Low">
										<div className="flex items-center">
											<span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
											Low
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="dueDate" className="text-sm font-medium">
								Due Date
							</Label>
							<Input
								id="dueDate"
								type="date"
								{...register("dueDate")}
								className="mt-1.5 border-gray-300"
							/>
						</div>
					</div>

					{/* Assignment Section */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<Label className="text-sm font-medium">Assign To</Label>
							<div className="flex gap-2">
								<Button 
									type="button" 
									variant="outline" 
									size="sm" 
									onClick={assignToAnyone}
									className="h-8 text-xs"
								>
									<Mail className="h-3.5 w-3.5 mr-1" />
									Anyone
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setShowInviteForm(!showInviteForm)}
									className={`h-8 text-xs ${
										showInviteForm ? "bg-green-50 border-green-200" : ""
									}`}
								>
									<UserPlus className="h-3.5 w-3.5 mr-1" />
									Invite Member
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setQuickAssign(!quickAssign)}
									className={`h-8 text-xs ${
										quickAssign ? "bg-blue-50 border-blue-200" : ""
									}`}
								>
									<Plus className="h-3.5 w-3.5 mr-1" />
									Quick Assign
								</Button>
							</div>
						</div>

						{/* Invite Member Form */}
						{showInviteForm && (
							<div className="mt-3 p-3 border border-green-200 rounded-md bg-green-50">
								<div className="flex items-center gap-2 mb-2">
									<UserPlus className="h-4 w-4 text-green-600" />
									<span className="text-sm font-medium text-green-800">
										Invite New Team Member
									</span>
								</div>
								<div className="flex gap-2">
									<Input
										type="email"
										placeholder="Enter email address..."
										value={inviteEmail}
										onChange={(e) => setInviteEmail(e.target.value)}
										className="flex-1 border-green-300 focus:border-green-500"
										disabled={inviteLoading}
									/>
									<Button
										type="button"
										size="sm"
										onClick={handleInviteMember}
										disabled={inviteLoading}
										className="bg-green-600 hover:bg-green-700 text-white"
									>
										{inviteLoading ? (
											<>
												<div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1" />
												Sending...
											</>
										) : (
											<>
												<Mail className="h-3 w-3 mr-1" />
												Send Invite
											</>
										)}
									</Button>
								</div>
								<p className="text-xs text-green-600 mt-1">
									They will receive an email invitation to join the "{activeDashboard?.name}" dashboard
								</p>
							</div>
						)}

						{/* Selected Assignees Display */}
						{selectedAssignees.length > 0 && (
							<div className="flex flex-wrap gap-2 mb-3">
								{selectedAssignees.map((user) => (
									<Badge
										key={user._id}
										className="flex items-center gap-1.5 py-1 pl-1 pr-2 bg-blue-50 text-blue-700 hover:bg-blue-100"
									>
										<Avatar className="h-5 w-5 border border-blue-200">
											<AvatarImage
												src={user.photoURL || "https://via.placeholder.com/40"}
												alt={user.name}
											/>
											<AvatarFallback className="text-xs bg-blue-200 text-blue-700">
												{user.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<span className="text-xs">{user.name}</span>
										<button
											type="button"
											onClick={() => removeAssignee(user._id)}
											className="text-blue-700 hover:text-blue-900"
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))}
							</div>
						)}

						{/* Search Users */}
						<div className="relative">
							<Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<Input
								type="text"
								placeholder="Search users..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 border-gray-300"
							/>
						</div>

						{/* Users List */}
						<div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
							{filteredUsers && filteredUsers.length > 0 ? (
								filteredUsers.map((user) => (
									<div
										key={user._id}
										className={`
                      flex items-center gap-3 p-2.5 border-b last:border-b-0 cursor-pointer
                      hover:bg-gray-50 transition-colors
                      ${
												selectedAssignees.some((u) => u._id === user._id)
													? "bg-blue-50"
													: ""
											}
                    `}
										onClick={() => toggleAssignee(user)}
									>
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={user.photoURL || "https://via.placeholder.com/40"}
												alt={user.name}
											/>
											<AvatarFallback className="bg-blue-100 text-blue-700">
												{user.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<div className="text-sm font-medium truncate">
												{user.name}
											</div>
											<div className="text-xs text-blue-600 truncate font-medium">
												{user.email}
											</div>
										</div>
										{selectedAssignees.some((u) => u._id === user._id) && (
											<span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
												<svg
													width="12"
													height="12"
													viewBox="0 0 12 12"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M10 3L4.5 8.5L2 6"
														stroke="white"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</span>
										)}
									</div>
								))
							) : (
								<div className="p-4 text-center text-gray-500">
									{searchQuery ? "No users found" : "Loading users..."}
								</div>
							)}
						</div>
					</div>

					{/* Quick Assign User Panel */}
					{quickAssign && (
						<div className="bg-gray-50 p-3 rounded-md border">
							<h4 className="text-sm font-medium mb-2 flex items-center">
								<User className="h-4 w-4 mr-1.5" />
								Quick Assign Team Members
							</h4>
							<div className="flex flex-wrap gap-2">
								{users?.slice(0, 5).map((user) => (
									<Badge
										key={user._id}
										variant="outline"
										className={`
                      cursor-pointer hover:bg-blue-50
                      ${
												selectedAssignees.some((u) => u._id === user._id)
													? "bg-blue-50 border-blue-200 text-blue-700"
													: "bg-white"
											}
                    `}
										onClick={() => toggleAssignee(user)}
									>
										{user.name}
									</Badge>
								))}
								<Badge
									variant="outline"
									className={`
                    cursor-pointer hover:bg-blue-50
                    ${
											selectedAssignees.some((u) => u._id === "anyone")
												? "bg-blue-50 border-blue-200 text-blue-700"
												: "bg-white"
										}
                  `}
									onClick={assignToAnyone}
								>
									<Mail className="h-3 w-3 mr-1" />
									Anyone
								</Badge>
							</div>
						</div>
					)}

					{/* Task Preview */}
					{(currentTitle || currentDescription) && (
						<div className="bg-gray-50 p-3 rounded-md border">
							<h4 className="text-xs font-medium text-gray-500 mb-2">
								TASK PREVIEW
							</h4>
							<div className="space-y-2">
								{currentTitle && (
									<h3 className="text-sm font-medium">{currentTitle}</h3>
								)}
								{currentDescription && (
									<p className="text-xs text-gray-600 line-clamp-2">
										{currentDescription}
									</p>
								)}
								<div className="flex items-center gap-2">
									<Badge
										className={`text-xs ${getPriorityColor(currentPriority)}`}
									>
										{currentPriority}
									</Badge>
									<Badge className="text-xs bg-blue-100 text-blue-800">
										{currentCategory}
									</Badge>
								</div>
							</div>
						</div>
					)}

					{/* Dialog Footer */}
					<DialogFooter className="gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
							className="border-gray-300"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="bg-blue-600 hover:bg-blue-700"
						>
							{isSubmitting ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									{initialData ? "Updating..." : "Creating..."}
								</>
							) : initialData ? (
								"Update Task"
							) : (
								"Create Task"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default TaskForm;
