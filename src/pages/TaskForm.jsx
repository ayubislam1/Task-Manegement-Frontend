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
import {
	Search,
	X,
	Mail,
	Plus,
	User,
	Calendar,
	Clock,
	Flag,
	CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../context/DashboardContext";

const TaskForm = ({
	isOpen,
	onClose,
	onSubmit,
	initialData = null,
	columnId = "To-Do",
}) => {
	const { users } = useUsers();
	const { user } = useAuth();
	const { activeDashboard, members } = useDashboard();
	const [selectedAssignees, setSelectedAssignees] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [quickAssign, setQuickAssign] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		watch,
		setValue,
	} = useForm({
		defaultValues: {
			title: "",
			description: "",
			category: columnId,
			priority: "Medium",
			dueDate: format(new Date(), "yyyy-MM-dd"),
		},
	});

	// Watch form values for live preview
	const currentTitle = watch("title");
	const currentDescription = watch("description");
	const currentCategory = watch("category");
	const currentPriority = watch("priority");
	useEffect(() => {
		if (initialData) {
			setValue("title", initialData.title || "");
			setValue("description", initialData.description || "");
			setValue("category", initialData.category || columnId);
			setValue("priority", initialData.priority || "Medium");
			setValue(
				"dueDate",
				initialData.dueDate
					? format(new Date(initialData.dueDate), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd")
			);
			if (initialData.assignedTo) {
				setSelectedAssignees(
					Array.isArray(initialData.assignedTo)
						? initialData.assignedTo
						: [initialData.assignedTo]
				);
			}
		} else {
			reset({
				title: "",
				description: "",
				category: columnId,
				priority: "Medium",
				dueDate: format(new Date(), "yyyy-MM-dd"),
			});
			setSelectedAssignees([]);
		}
	}, [initialData, columnId, setValue, reset]);
	const handleFormSubmit = async (data) => {
		try {
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
	const toggleAssignee = (member) => {
		setSelectedAssignees((prev) => {
			// Check by _id, uid, or email for dashboard members
			const isSelected = prev.some(
				(u) =>
					u._id === member._id ||
					u._id === member.uid ||
					u.email === member.email
			);
			if (isSelected) {
				return prev.filter(
					(u) =>
						u._id !== member._id &&
						u._id !== member.uid &&
						u.email !== member.email
				);
			} else {
				// Normalize the member data for assignment
				const normalizedMember = {
					_id: member._id || member.uid,
					name: member.name,
					email: member.email,
					photoURL: member.photoURL,
				};
				return [...prev, normalizedMember];
			}
		});
	};
	const removeAssignee = (userId) => {
		setSelectedAssignees((prev) =>
			prev.filter((u) => u._id !== userId && u.email !== userId)
		);
	};
	const assignToAnyone = () => {
		const anyoneUser = {
			_id: "anyone",
			name: "Anyone",
			email: "anyone@team.com",
			photoURL: null,
		};
		toggleAssignee(anyoneUser);
	};
	const filteredUsers = members?.filter(
		(member) =>
			member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			member.email.toLowerCase().includes(searchQuery.toLowerCase())
	);
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
			{" "}
			<DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-2xl">
				{" "}
				<DialogHeader className="pb-6 border-b border-gray-100 dark:border-gray-800">
					{" "}
					<DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
						{" "}
						<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
							{" "}
							{initialData ? (
								<CheckCircle className="w-6 h-6 text-white" />
							) : (
								<Plus className="w-6 h-6 text-white" />
							)}{" "}
						</div>{" "}
						{initialData ? "Edit Task" : "Create New Task"}{" "}
					</DialogTitle>{" "}
					<DialogDescription className="text-gray-600 dark:text-gray-400 text-base mt-2">
						{" "}
						{initialData
							? "Update the details and assignment for this task."
							: "Fill out the details to create a new task and assign team members."}{" "}
					</DialogDescription>{" "}
				</DialogHeader>{" "}
				<form
					onSubmit={handleSubmit(handleFormSubmit)}
					className="space-y-8 pt-6"
				>
					{" "}
					{/* Enhanced Title Section */}{" "}
					<div className="space-y-3">
						{" "}
						<Label
							htmlFor="title"
							className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
						>
							{" "}
							<Flag className="w-4 h-4 text-blue-500" /> Task Title{" "}
						</Label>{" "}
						<Input
							id="title"
							placeholder="Enter a descriptive task title..."
							{...register("title", { required: "Title is required" })}
							className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
						/>{" "}
						{errors.title && (
							<p className="text-sm text-red-500 mt-1 flex items-center gap-1">
								{" "}
								<X className="w-4 h-4" /> {errors.title.message}{" "}
							</p>
						)}{" "}
					</div>{" "}
					{/* Enhanced Description Section */}{" "}
					<div className="space-y-3">
						{" "}
						<Label
							htmlFor="description"
							className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
						>
							{" "}
							<Search className="w-4 h-4 text-blue-500" /> Description{" "}
						</Label>{" "}
						<Textarea
							id="description"
							placeholder="Describe the task details, requirements, and any important notes..."
							{...register("description")}
							className="min-h-32 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-xl resize-none transition-all duration-200"
						/>{" "}
					</div>{" "}
					{/* Status and Priority Grid */}{" "}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{" "}
						{/* Enhanced Category Section */}{" "}
						<div className="space-y-3">
							{" "}
							<Label
								htmlFor="category"
								className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
							>
								{" "}
								<Flag className="w-4 h-4 text-blue-500" /> Status{" "}
							</Label>{" "}
							<Select
								value={currentCategory}
								onValueChange={(value) => setValue("category", value)}
							>
								{" "}
								<SelectTrigger className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 rounded-xl">
									{" "}
									<SelectValue placeholder="Select status" />{" "}
								</SelectTrigger>{" "}
								<SelectContent>
									{" "}
									<SelectItem value="To-Do">
										{" "}
										<div className="flex items-center gap-2">
											{" "}
											<div className="w-3 h-3 rounded-full bg-gray-400"></div>{" "}
											To-Do{" "}
										</div>{" "}
									</SelectItem>{" "}
									<SelectItem value="In Progress">
										{" "}
										<div className="flex items-center gap-2">
											{" "}
											<div className="w-3 h-3 rounded-full bg-blue-500"></div>{" "}
											In Progress{" "}
										</div>{" "}
									</SelectItem>{" "}
									<SelectItem value="Done">
										{" "}
										<div className="flex items-center gap-2">
											{" "}
											<div className="w-3 h-3 rounded-full bg-green-500"></div>{" "}
											Done{" "}
										</div>{" "}
									</SelectItem>{" "}
								</SelectContent>{" "}
							</Select>{" "}
						</div>{" "}
						{/* Enhanced Priority Section */}{" "}
						<div className="space-y-3">
							{" "}
							<Label
								htmlFor="priority"
								className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
							>
								{" "}
								<Flag className="w-4 h-4 text-red-500" /> Priority{" "}
							</Label>{" "}
							<Select
								value={watch("priority")}
								onValueChange={(value) => setValue("priority", value)}
							>
								{" "}
								<SelectTrigger className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 rounded-xl">
									{" "}
									<SelectValue placeholder="Select priority" />{" "}
								</SelectTrigger>{" "}
								<SelectContent>
									{" "}
									<SelectItem value="High">
										{" "}
										<div className="flex items-center gap-2">
											{" "}
											<div className="w-3 h-3 rounded-full bg-red-500"></div>{" "}
											<span className="font-medium">High Priority</span>{" "}
										</div>{" "}
									</SelectItem>{" "}
									<SelectItem value="Medium">
										{" "}
										<div className="flex items-center gap-2">
											{" "}
											<div className="w-3 h-3 rounded-full bg-yellow-500"></div>{" "}
											<span className="font-medium">Medium Priority</span>{" "}
										</div>{" "}
									</SelectItem>{" "}
									<SelectItem value="Low">
										{" "}
										<div className="flex items-center gap-2">
											{" "}
											<div className="w-3 h-3 rounded-full bg-green-500"></div>{" "}
											<span className="font-medium">Low Priority</span>{" "}
										</div>{" "}
									</SelectItem>{" "}
								</SelectContent>{" "}
							</Select>{" "}
						</div>{" "}
						{/* Enhanced Due Date Section */}{" "}
						<div className="space-y-3">
							{" "}
							<Label
								htmlFor="dueDate"
								className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
							>
								{" "}
								<Calendar className="w-4 h-4 text-blue-500" /> Due Date{" "}
							</Label>{" "}
							<Input
								id="dueDate"
								type="date"
								{...register("dueDate")}
								className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
							/>{" "}
						</div>{" "}
					</div>{" "}
					{/* Enhanced Assignment Section */}{" "}
					<div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-100 dark:border-blue-800">
						{" "}
						<div className="flex justify-between items-center">
							{" "}
							<Label className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
								{" "}
								<User className="w-5 h-5 text-blue-500" /> Assign Team Members{" "}
							</Label>{" "}
							<div className="flex gap-3">
								{" "}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={assignToAnyone}
									className="h-10 px-4 text-sm font-medium bg-white hover:bg-blue-50 border-blue-200 text-blue-700 rounded-xl"
								>
									{" "}
									<Mail className="h-4 w-4 mr-2" /> Assign to Anyone{" "}
								</Button>{" "}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setQuickAssign(!quickAssign)}
									className={`h-10 px-4 text-sm font-medium rounded-xl transition-all duration-200 ${
										quickAssign
											? "bg-blue-100 border-blue-300 text-blue-800"
											: "bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
									}`}
								>
									{" "}
									<Plus className="h-4 w-4 mr-2" />{" "}
									{quickAssign ? "Hide Members" : "Show All Members"}{" "}
								</Button>{" "}
							</div>{" "}
						</div>{" "}
						{/* Enhanced Selected Assignees Display */}{" "}
						{selectedAssignees.length > 0 && (
							<div className="space-y-3">
								{" "}
								<h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
									{" "}
									Assigned to ({selectedAssignees.length}){" "}
								</h4>{" "}
								<div className="flex flex-wrap gap-3">
									{" "}
									{selectedAssignees.map((user) => (
										<div
											key={user._id}
											className="flex items-center gap-3 py-3 px-4 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
										>
											{" "}
											<Avatar className="h-8 w-8 border-2 border-blue-300">
												{" "}
												<AvatarImage
													src={
														user.photoURL || "https://via.placeholder.com/40"
													}
													alt={user.name}
												/>{" "}
												<AvatarFallback className="text-sm bg-blue-100 text-blue-700 font-semibold">
													{" "}
													{user.name.charAt(0)}{" "}
												</AvatarFallback>{" "}
											</Avatar>{" "}
											<div className="flex-1 min-w-0">
												{" "}
												<div className="text-sm font-medium text-gray-900 dark:text-white truncate">
													{" "}
													{user.name}{" "}
												</div>{" "}
												<div className="text-xs text-gray-500 dark:text-gray-400 truncate">
													{" "}
													{user.email}{" "}
												</div>{" "}
											</div>{" "}
											<button
												type="button"
												onClick={() => removeAssignee(user._id)}
												className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-colors"
											>
												{" "}
												<X className="w-3 h-3" />{" "}
											</button>{" "}
										</div>
									))}{" "}
								</div>{" "}
							</div>
						)}{" "}
						{/* Enhanced Search Users */}{" "}
						{quickAssign && (
							<div className="space-y-4">
								{" "}
								<div className="relative">
									{" "}
									<Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />{" "}
									<Input
										type="text"
										placeholder="Search team members..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-12 h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-xl"
									/>{" "}
								</div>{" "}
								{/* Enhanced Users List */}{" "}
								<div className="max-h-60 overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
									{" "}
									{filteredUsers && filteredUsers.length > 0 ? (
										filteredUsers.map((member) => (
											<div
												key={member._id || member.uid || member.email}
												className={`													flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer													hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200													${
													selectedAssignees.some(
														(u) =>
															u._id === member._id ||
															u._id === member.uid ||
															u.email === member.email
													)
														? "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-l-blue-500"
														: ""
												}												`}
												onClick={() => toggleAssignee(member)}
											>
												{" "}
												<Avatar className="h-10 w-10 border-2 border-gray-200">
													<AvatarImage
														src={
															member.photoURL ||
															"https://via.placeholder.com/40"
														}
														alt={member.name}
													/>
													<AvatarFallback className="bg-gray-100 text-gray-700 font-semibold">
														{member.name.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<div className="text-base font-semibold text-gray-900 dark:text-white truncate">
														{member.name}
													</div>
													<div className="text-sm text-gray-600 dark:text-gray-400 truncate">
														{member.email}
													</div>
													{member.role && (
														<div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
															{member.role}
														</div>
													)}
												</div>
												{selectedAssignees.some(
													(u) =>
														u._id === member._id ||
														u._id === member.uid ||
														u.email === member.email
												) && (
													<div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
														<CheckCircle className="w-4 h-4 text-white" />
													</div>
												)}
											</div>
										))
									) : (
										<div className="text-center py-8 text-gray-500 dark:text-gray-400">
											{" "}
											<User className="w-12 h-12 mx-auto mb-3 opacity-50" />{" "}
											<p className="text-sm">No team members found</p>{" "}
											<p className="text-xs mt-1">Try adjusting your search</p>{" "}
										</div>
									)}{" "}
								</div>{" "}
							</div>
						)}{" "}
					</div>{" "}
					{/* Task Preview */}{" "}
					{(currentTitle || currentDescription) && (
						<div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
							{" "}
							<h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
								{" "}
								<CheckCircle className="w-4 h-4" /> TASK PREVIEW{" "}
							</h4>{" "}
							<div className="space-y-3">
								{" "}
								{currentTitle && (
									<h3 className="text-lg font-bold text-gray-900 dark:text-white">
										{currentTitle}
									</h3>
								)}{" "}
								{currentDescription && (
									<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
										{" "}
										{currentDescription}{" "}
									</p>
								)}{" "}
								<div className="flex items-center gap-3 flex-wrap">
									{" "}
									<Badge
										className={`text-sm ${getPriorityColor(currentPriority)}`}
									>
										{" "}
										{currentPriority} Priority{" "}
									</Badge>{" "}
									<Badge className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
										{" "}
										{currentCategory}{" "}
									</Badge>{" "}
									{selectedAssignees.length > 0 && (
										<Badge className="text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
											{" "}
											{selectedAssignees.length} Assignee
											{selectedAssignees.length > 1 ? "s" : ""}{" "}
										</Badge>
									)}{" "}
								</div>{" "}
							</div>{" "}
						</div>
					)}{" "}
					{/* Enhanced Dialog Footer */}{" "}
					<DialogFooter className="gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
						{" "}
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
							className="h-12 px-6 text-base border-2 border-gray-300 hover:border-gray-400 rounded-xl"
						>
							{" "}
							Cancel{" "}
						</Button>{" "}
						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-12 px-8 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
						>
							{" "}
							{isSubmitting ? (
								<>
									{" "}
									<div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>{" "}
									{initialData ? "Updating..." : "Creating..."}{" "}
								</>
							) : (
								<>
									{" "}
									{initialData ? (
										<>
											{" "}
											<CheckCircle className="w-5 h-5 mr-2" /> Update Task{" "}
										</>
									) : (
										<>
											{" "}
											<Plus className="w-5 h-5 mr-2" /> Create Task{" "}
										</>
									)}{" "}
								</>
							)}{" "}
						</Button>{" "}
					</DialogFooter>{" "}
				</form>{" "}
			</DialogContent>{" "}
		</Dialog>
	);
};
export default TaskForm;
