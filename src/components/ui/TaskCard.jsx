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

const TaskCard = ({ task,onDelete }) => {
	const [showMenu, setShowMenu] = useState(false);
	const [showTooltip, setShowTooltip] = useState(null);
	const menuRef = useRef(null);
	const assignedUsers = task.assignedTo;
	const navigate = useNavigate();
	const axiosPublic = useAxiosPublic();
	console.log(task);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMenu(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleDelete = (id) => {
		axiosPublic.delete(`/task-delete/${id}`).then((res) => {
			console.log(res.data);
			if (res.data.deletedCount > 0) {
				toast("Task deleted Successfully!");
        onDelete(id)
			}
		});
	};

	const onOpen = (id) => {
		navigate(`/dashboard/task-details/${id}`);
	};

	return (
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
									setShowMenu(false);
								}}
							>
								<Edit className="w-4 h-4 mr-2 text-green-500" />
								Edit
							</button>
							<button
								className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
								onClick={() => {
									handleDelete(task._id);
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
	);
};

export default TaskCard;
