import React, { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Users, PlusCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import DashboardForm from "../components/DashboardForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../hooks/useAuth";

const Team = () => {
	const [userData, isLoading] = useUsers();
	const { user } = useAuth();
	const {
		dashboards,
		activeDashboard,
		members,
		onlineMembers,
		loading: dashboardLoading,
		switchDashboard,
	} = useDashboard();
	const axiosSecure = useAxiosSecure();

	// Function to check if a user is an admin
	const isUserAdmin = (userEmail) => {
		if (!activeDashboard || !activeDashboard.members) return false;

		// Check if the user is the original creator
		if (activeDashboard.createdBy?.email === userEmail) return true;

		// Check if the user has been given admin role
		const member = activeDashboard.members.find((m) => m.email === userEmail);
		return member?.role === "Admin";
	};

	// Function to check if the current user is an admin of the active dashboard
	const isCurrentUserAdmin = () => {
		if (!activeDashboard || !user?.email) return false;
		return isUserAdmin(user.email);
	};

	if (isLoading || dashboardLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-4rem)]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="px-2 sm:px-4">
			<h1 className="text-xl sm:text-2xl font-semibold text-center mb-6">
				Team Collaboration
			</h1>

			{/* Dashboard Section */}
			<div className="mb-8">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold flex items-center">
						<Users className="mr-2 h-5 w-5" />
						Your Dashboards
					</h2>
					<Dialog>
						<DialogTrigger asChild>
							<Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
								<PlusCircle className="mr-2 h-4 w-4" />
								New Dashboard
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
							<DashboardForm
								onSuccess={() =>
									toast.success("Dashboard created successfully")
								}
							/>
						</DialogContent>
					</Dialog>
				</div>

				{/* Dashboard cards - existing code */}
				{dashboards.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						{dashboards.map((dashboard) => (
							<Card
								key={dashboard._id}
								onClick={() => switchDashboard(dashboard)}
								className={`cursor-pointer p-4 hover:shadow-md transition-all ${
									activeDashboard?._id === dashboard._id
										? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
										: ""
								}`}
							>
								<h3 className="font-semibold text-lg">{dashboard.name}</h3>
								{dashboard.description && (
									<p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
										{dashboard.description}
									</p>
								)}
								<div className="flex items-center mt-3 text-xs text-gray-500">
									<span className="flex items-center">
										<Users size={14} className="mr-1" />
										{dashboard.members?.length || 1}{" "}
										{dashboard.members?.length === 1 ? "member" : "members"}
									</span>
									<span className="mx-2">•</span>
									<span className="text-xs">
										{dashboard.createdBy?.email === user?.email
											? "You are admin"
											: `Created by ${
													dashboard.createdBy?.name ||
													dashboard.createdBy?.email ||
													"Unknown"
											  }`}
									</span>
								</div>
							</Card>
						))}
					</div>
				) : (
					<Card className="p-6 text-center mb-6">
						<h3 className="text-base font-medium mb-2">No Dashboards Yet</h3>
						<p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
							Create your first dashboard to start collaborating with your team
						</p>
						<Dialog>
							<DialogTrigger asChild>
								<Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
									<PlusCircle className="mr-2 h-4 w-4" />
									Create Your First Dashboard
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
								<DashboardForm
									onSuccess={() =>
										toast.success("Dashboard created successfully")
									}
								/>
							</DialogContent>
						</Dialog>
					</Card>
				)}
			</div>

			{/* All Users Section - kept as is */}
			<div className="mt-10">
				<h2 className="text-lg font-semibold mb-4">All Platform Users</h2>
				<div className="w-full overflow-x-auto pb-2">
					<Table className="min-w-[600px] lg:min-w-full border border-gray-200 shadow-sm rounded-lg">
						<TableHeader className="bg-blue-100">
							<TableRow>
								<TableHead className="w-[50px] sm:w-[60px]">Avatar</TableHead>
								<TableHead className="min-w-[120px]">Name</TableHead>
								<TableHead className="min-w-[160px] sm:min-w-[200px] hidden sm:table-cell">
									Email
								</TableHead>
								<TableHead className="min-w-[80px] sm:min-w-[100px] hidden sm:table-cell">
									Role
								</TableHead>
								<TableHead className="min-w-[80px] sm:min-w-[100px]">
									Status
								</TableHead>
								<TableHead className="text-right min-w-[100px] sm:min-w-[120px]">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{userData && userData.length > 0 ? (
								userData.map((user) => (
									<TableRow
										key={user._id || user.id}
										className="hover:bg-gray-50 transition *:py-2 sm:*:py-3"
									>
										<TableCell>
											<Avatar className="h-8 w-8 sm:h-10 sm:w-10">
												<AvatarImage
													src={user?.photoURL}
													alt={user?.name || "User"}
												/>
												<AvatarFallback className="text-sm sm:text-base">
													{user?.name ? user.name.charAt(0).toUpperCase() : "?"}
												</AvatarFallback>
											</Avatar>
										</TableCell>
										<TableCell className="font-medium text-sm sm:text-base">
											{user?.name || "Anonymous User"}
										</TableCell>
										<TableCell className="text-gray-600 text-sm sm:text-base hidden sm:table-cell truncate">
											{user?.email || "No email"}
										</TableCell>
										<TableCell className="text-gray-600 text-sm sm:text-base hidden sm:table-cell">
											{user?.role || "Member"}
										</TableCell>
										<TableCell className="text-gray-600 text-sm sm:text-base">
											<span className="inline-block sm:hidden">
												{user?.status ? user.status.substring(0, 1) : "A"}
											</span>
											<span className="hidden sm:inline">
												{user?.status || "Active"}
											</span>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end space-x-1 sm:space-x-3">
												<Button
													size="icon"
													variant="outline"
													className="h-7 w-7 sm:h-9 sm:w-9 hover:bg-blue-100"
												>
													<Pencil className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													className="h-7 w-7 sm:h-9 sm:w-9 hover:bg-red-100"
												>
													<Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-4">
										No users found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
};

export default Team;
