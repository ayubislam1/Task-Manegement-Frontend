import React, { useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from "./ui/dropdown-menu";
import {
	Users,
	Crown,
	User,
	UserMinus,
	Settings,
	MoreVertical,
	Shield,
} from "lucide-react";
import { toast } from "react-hot-toast";
import MemberStatusIndicator from "./MemberStatusIndicator";

const TaskBoardTeamManager = () => {
	const {
		activeDashboard,
		members,
		onlineMembers,
		updateMemberRole,
		removeMember,
	} = useDashboard();
	const { user } = useAuth();
	const [processingMemberId, setProcessingMemberId] = useState(null);

	// Check if current user is admin
	const isCurrentUserAdmin = activeDashboard?.members?.some(
		(member) => member.email === user?.email && member.role === "Admin"
	);

	const handleRoleChange = async (memberId, newRole) => {
		if (!isCurrentUserAdmin) {
			toast.error("Only admins can change member roles");
			return;
		}

		const member = members.find((m) => (m.uid || m._id) === memberId);
		if (member?.email === user?.email) {
			toast.error("You cannot change your own role");
			return;
		}

		setProcessingMemberId(memberId);
		try {
			const success = await updateMemberRole(
				activeDashboard._id,
				memberId,
				newRole
			);
			if (success) {
				toast.success(
					`${member?.name || member?.email}'s role changed to ${newRole}`
				);
			}
		} catch (error) {
			console.error("Error updating role:", error);
			toast.error("Failed to update member role");
		} finally {
			setProcessingMemberId(null);
		}
	};

	const handleRemoveMember = async (memberId) => {
		if (!isCurrentUserAdmin) {
			toast.error("Only admins can remove members");
			return;
		}

		const member = members.find((m) => (m.uid || m._id) === memberId);
		if (member?.email === user?.email) {
			toast.error("You cannot remove yourself");
			return;
		}

		if (
			window.confirm(
				`Are you sure you want to remove ${member?.name || member?.email}?`
			)
		) {
			setProcessingMemberId(memberId);
			try {
				const success = await removeMember(activeDashboard._id, memberId);
				if (success) {
					toast.success(`${member?.name || member?.email} removed from team`);
				}
			} catch (error) {
				console.error("Error removing member:", error);
				toast.error("Failed to remove member");
			} finally {
				setProcessingMemberId(null);
			}
		}
	};

	if (!activeDashboard || !members.length) {
		return null;
	}

	const adminCount = members.filter((m) => m.role === "Admin").length;
	const memberCount = members.filter((m) => m.role === "Member").length;

	return (
		<div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
			{/* Team Stats */}
			<div className="flex items-center gap-2">
				<Users className="h-4 w-4 text-blue-500" />
				<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
					{members.length} Members
				</span>
				<Badge variant="secondary" className="text-xs">
					{adminCount} Admin{adminCount > 1 ? "s" : ""}
				</Badge>
			</div>

			{/* Online Members Preview */}
			<div className="flex items-center gap-2">
				<div className="flex -space-x-2">
					{members.slice(0, 5).map((member) => {
						const isOnline = onlineMembers.some(
							(om) => om.email === member.email
						);
						return (
							<div key={member.uid || member._id} className="relative">
								<Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
									<AvatarImage src={member.photoURL} alt={member.name} />
									<AvatarFallback className="text-xs">
										{(member.name || member.email).charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<MemberStatusIndicator
									member={member}
									isOnline={isOnline}
									size="xs"
									showTooltip={true}
								/>
							</div>
						);
					})}
					{members.length > 5 && (
						<div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
							<span className="text-xs font-medium text-gray-600 dark:text-gray-400">
								+{members.length - 5}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Team Management Dropdown - Only for Admins */}
			{isCurrentUserAdmin && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="ml-auto">
							<Settings className="h-4 w-4 mr-1" />
							Manage Team
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-80">
						<DropdownMenuLabel className="flex items-center gap-2">
							<Shield className="h-4 w-4" />
							Team Management
						</DropdownMenuLabel>
						<DropdownMenuSeparator />

						<div className="max-h-64 overflow-y-auto">
							{members.map((member) => {
								const isCurrentUser = member.email === user?.email;
								const isOnline = onlineMembers.some(
									(om) => om.email === member.email
								);
								const isProcessing =
									processingMemberId === (member.uid || member._id);

								return (
									<div
										key={member.uid || member._id}
										className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-sm"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2 min-w-0">
												<div className="relative">
													<Avatar className="h-8 w-8">
														<AvatarImage
															src={member.photoURL}
															alt={member.name}
														/>
														<AvatarFallback className="text-xs">
															{(member.name || member.email)
																.charAt(0)
																.toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<MemberStatusIndicator
														member={member}
														isOnline={isOnline}
														size="xs"
														showTooltip={false}
													/>
												</div>

												<div className="min-w-0">
													<div className="flex items-center gap-1">
														<span className="text-sm font-medium truncate">
															{member.name || "Unknown User"}
														</span>
														{isCurrentUser && (
															<Badge
																variant="outline"
																className="text-xs px-1 py-0"
															>
																You
															</Badge>
														)}
													</div>
													<span className="text-xs text-gray-500 truncate block">
														{member.email}
													</span>
												</div>
											</div>

											<div className="flex items-center gap-2 flex-shrink-0">
												{/* Role Selector/Display */}
												{!isCurrentUser ? (
													<Select
														value={member.role}
														onValueChange={(value) =>
															handleRoleChange(member.uid || member._id, value)
														}
														disabled={isProcessing}
													>
														<SelectTrigger className="w-20 h-6 text-xs">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="Admin">
																<div className="flex items-center gap-1">
																	<Crown className="h-3 w-3" />
																	Admin
																</div>
															</SelectItem>
															<SelectItem value="Member">
																<div className="flex items-center gap-1">
																	<User className="h-3 w-3" />
																	Member
																</div>
															</SelectItem>
														</SelectContent>
													</Select>
												) : (
													<Badge
														variant={
															member.role === "Admin" ? "default" : "outline"
														}
														className="text-xs"
													>
														{member.role === "Admin" ? (
															<>
																<Crown className="h-3 w-3 mr-1" />
																Admin
															</>
														) : (
															<>
																<User className="h-3 w-3 mr-1" />
																Member
															</>
														)}
													</Badge>
												)}

												{/* Remove Button */}
												{!isCurrentUser && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															handleRemoveMember(member.uid || member._id)
														}
														disabled={isProcessing}
														className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
													>
														<UserMinus className="h-3 w-3" />
													</Button>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			)}

			{/* Non-admin view */}
			{!isCurrentUserAdmin && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="ml-auto">
							<Users className="h-4 w-4 mr-1" />
							View Team
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-64">
						<DropdownMenuLabel>Team Members</DropdownMenuLabel>
						<DropdownMenuSeparator />

						<div className="max-h-48 overflow-y-auto">
							{members.map((member) => {
								const isCurrentUser = member.email === user?.email;
								const isOnline = onlineMembers.some(
									(om) => om.email === member.email
								);

								return (
									<div
										key={member.uid || member._id}
										className="p-2 flex items-center gap-2"
									>
										<div className="relative">
											<Avatar className="h-6 w-6">
												<AvatarImage src={member.photoURL} alt={member.name} />
												<AvatarFallback className="text-xs">
													{(member.name || member.email)
														.charAt(0)
														.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<MemberStatusIndicator
												member={member}
												isOnline={isOnline}
												size="xs"
												showTooltip={false}
											/>
										</div>

										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-1">
												<span className="text-sm font-medium truncate">
													{member.name || "Unknown User"}
												</span>
												{isCurrentUser && (
													<Badge
														variant="outline"
														className="text-xs px-1 py-0"
													>
														You
													</Badge>
												)}
											</div>
										</div>

										<Badge
											variant={member.role === "Admin" ? "default" : "outline"}
											className="text-xs flex-shrink-0"
										>
											{member.role === "Admin" ? (
												<>
													<Crown className="h-3 w-3 mr-1" />
													Admin
												</>
											) : (
												<>
													<User className="h-3 w-3 mr-1" />
													Member
												</>
											)}
										</Badge>
									</div>
								);
							})}
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
};

export default TaskBoardTeamManager;
