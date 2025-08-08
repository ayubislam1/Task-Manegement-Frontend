import React, { useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
	Shield,
	User,
	UserMinus,
	Crown,
	Settings,
	AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import MemberStatusIndicator from "./MemberStatusIndicator";

const TeamManagement = () => {
	const {
		activeDashboard,
		members,
		updateMemberRole,
		removeMember,
		onlineMembers,
	} = useDashboard();
	const { user } = useAuth();
	const [changingRole, setChangingRole] = useState(false);
	const [processingMemberId, setProcessingMemberId] = useState(null);

	// Check if current user is an admin of this dashboard
	const isCurrentUserAdmin = activeDashboard?.members?.some(
		(member) => member.email === user?.email && member.role === "Admin"
	);

	// Get current user's role
	const currentUserRole = activeDashboard?.members?.find(
		(member) => member.email === user?.email
	)?.role;

	const handleRoleChange = async (memberId, newRole) => {
		if (!isCurrentUserAdmin) {
			toast.error("শুধুমাত্র অ্যাডমিনরা সদস্যদের ভূমিকা পরিবর্তন করতে পারেন");
			return;
		}

		const member = members.find((m) => (m.uid || m._id) === memberId);
		if (member?.email === user?.email) {
			toast.error("আপনি নিজের ভূমিকা পরিবর্তন করতে পারবেন না");
			return;
		}

		if (
			window.confirm(
				`Are you sure you want to change ${
					member?.name || member?.email
				} to ${newRole}?`
			)
		) {
			setChangingRole(true);
			setProcessingMemberId(memberId);

			try {
				const success = await updateMemberRole(
					activeDashboard._id,
					memberId,
					newRole
				);
				if (success) {
					toast.success(
						`${
							member?.name || member?.email
						} এর ভূমিকা ${newRole} এ পরিবর্তন করা হয়েছে`
					);
				}
			} catch (error) {
				console.error("Error updating role:", error);
				toast.error("ভূমিকা পরিবর্তন করতে ব্যর্থ হয়েছে");
			} finally {
				setChangingRole(false);
				setProcessingMemberId(null);
			}
		}
	};

	const handleRemoveMember = async (memberId) => {
		if (!isCurrentUserAdmin) {
			toast.error("শুধুমাত্র অ্যাডমিনরা সদস্যদের সরাতে পারেন");
			return;
		}

		const member = members.find((m) => (m.uid || m._id) === memberId);
		if (member?.email === user?.email) {
			toast.error("আপনি নিজেকে ড্যাশবোর্ড থেকে সরাতে পারবেন না");
			return;
		}

		if (
			window.confirm(
				`আপনি কি নিশ্চিত যে ${member?.name || member?.email} কে সরাতে চান?`
			)
		) {
			setProcessingMemberId(memberId);

			try {
				const success = await removeMember(activeDashboard._id, memberId);
				if (success) {
					toast.success(
						`${member?.name || member?.email} কে সফলভাবে সরানো হয়েছে`
					);
				}
			} catch (error) {
				console.error("Error removing member:", error);
				toast.error("সদস্য সরাতে ব্যর্থ হয়েছে");
			} finally {
				setProcessingMemberId(null);
			}
		}
	};

	// Debug logging - only keep essential ones
	// console.log("🔍 TeamManagement Debug:", {
	//   activeDashboard: activeDashboard?.name,
	//   membersCount: members?.length,
	//   isAdmin: isCurrentUserAdmin,
	//   currentUser: user?.email,
	//   members: members
	// });

	if (!activeDashboard) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
				<h3 className="text-lg font-semibold text-yellow-800 mb-2">
					⚠️ No Active Dashboard
				</h3>
				<p className="text-yellow-700">
					Please select a dashboard to manage team members.
				</p>
			</div>
		);
	}

	if (!members || members.length === 0) {
		return (
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
				<h3 className="text-lg font-semibold text-blue-800 mb-2">
					👥 Team Management
				</h3>
				<p className="text-blue-700 mb-4">
					No team members found or still loading...
				</p>

				{/* Show dashboard members if available */}
				{activeDashboard.members && activeDashboard.members.length > 0 && (
					<div>
						<p className="text-sm text-blue-600 mb-2">
							Found {activeDashboard.members.length} members in dashboard data:
						</p>
						<div className="space-y-2">
							{activeDashboard.members.map((member, index) => (
								<div
									key={index}
									className="flex items-center justify-between bg-white p-2 rounded border"
								>
									<span className="text-sm">{member.name || member.email}</span>
									<span
										className={`px-2 py-1 rounded text-xs ${
											member.role === "Admin"
												? "bg-red-100 text-red-800"
												: "bg-blue-100 text-blue-800"
										}`}
									>
										{member.role}
									</span>
								</div>
							))}
						</div>
						<p className="text-xs text-blue-500 mt-2">
							⚠️ These members are not showing in the management interface.
							Check console for debugging info.
						</p>
					</div>
				)}
			</div>
		);
	}

	if (!activeDashboard) {
		return <p>কোন ড্যাশবোর্ড নির্বাচিত নেই</p>;
	}

	const adminCount = members.filter((m) => m.role === "Admin").length;
	const memberCount = members.filter((m) => m.role === "Member").length;

	return (
		<Card className="p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h3 className="text-xl font-semibold flex items-center gap-2">
						<Settings className="h-5 w-5 text-blue-500" />
						Team Management
					</h3>
					<p className="text-sm text-gray-500 mt-1">
						Manage roles and permissions for dashboard members
					</p>
				</div>

				<div className="flex gap-2">
					<Badge variant="secondary" className="flex items-center gap-1">
						<Crown className="h-3 w-3" />
						{adminCount} Admin{adminCount > 1 ? "s" : ""}
					</Badge>
					<Badge variant="outline" className="flex items-center gap-1">
						<User className="h-3 w-3" />
						{memberCount} Member{memberCount > 1 ? "s" : ""}
					</Badge>
				</div>
			</div>

			{!isCurrentUserAdmin && (
				<div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2">
					<AlertTriangle className="h-4 w-4 text-yellow-600" />
					<span className="text-sm text-yellow-700 dark:text-yellow-300">
						You have {currentUserRole} access. Only Admins can manage team
						members.
					</span>
				</div>
			)}

			<div className="space-y-3">
				{members.map((member) => {
					const isOnline = onlineMembers.some(
						(om) => om.email === member.email
					);
					const isCurrentUser = member.email === user?.email;
					const canModifyMember = isCurrentUserAdmin && !isCurrentUser;

					return (
						<div
							key={member.uid || member._id}
							className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
								isCurrentUser
									? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
									: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
							}`}
						>
							<div className="flex items-center space-x-4">
								<div className="relative">
									<Avatar className="h-10 w-10">
										<AvatarImage src={member.photoURL} alt={member.name} />
										<AvatarFallback className="font-medium">
											{member.name?.charAt(0) || member.email?.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<MemberStatusIndicator
										member={member}
										isOnline={isOnline}
										size="sm"
										showTooltip={false}
									/>
								</div>

								<div>
									<div className="flex items-center gap-2">
										<p className="font-medium text-gray-900 dark:text-gray-100">
											{member.name || "Unknown User"}
										</p>
										{isCurrentUser && (
											<Badge variant="outline" className="text-xs px-2 py-0.5">
												You
											</Badge>
										)}
									</div>
									<p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
										{member.email}
										{isOnline && (
											<span className="text-xs text-green-600 dark:text-green-400 font-medium">
												• Online
											</span>
										)}
									</p>
								</div>
							</div>

							<div className="flex items-center space-x-3">
								<div className="flex items-center space-x-2">
									{member.role === "Admin" ? (
										<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
											<Crown className="h-3 w-3" />
											Admin
										</Badge>
									) : (
										<Badge
											variant="outline"
											className="flex items-center gap-1"
										>
											<User className="h-3 w-3" />
											Member
										</Badge>
									)}

									{/* Role selector - only show for admins when they can modify the member */}
									{canModifyMember && (
										<Select
											defaultValue={member.role}
											onValueChange={(value) =>
												handleRoleChange(member.uid || member._id, value)
											}
											disabled={
												changingRole &&
												processingMemberId === (member.uid || member._id)
											}
										>
											<SelectTrigger className="w-28 h-8 text-xs">
												<SelectValue placeholder={member.role} />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Admin">
													<div className="flex items-center gap-2">
														<Crown className="h-3 w-3" />
														Admin
													</div>
												</SelectItem>
												<SelectItem value="Member">
													<div className="flex items-center gap-2">
														<User className="h-3 w-3" />
														Member
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									)}
								</div>

								{/* Remove button - only show for admins when they can modify the member */}
								{canModifyMember && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleRemoveMember(member.uid || member._id)}
										disabled={processingMemberId === (member.uid || member._id)}
										className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
									>
										<UserMinus className="h-4 w-4" />
									</Button>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{isCurrentUserAdmin && (
				<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
					<div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
						<p>• অ্যাডমিনরা সদস্যদের ভূমিকা পরিবর্তন এবং সরাতে পারেন</p>
						<p>• আপনি নিজের ভূমিকা পরিবর্তন বা নিজেকে সরাতে পারবেন না</p>
						<p>• ড্যাশবোর্ডে অন্তত একজন অ্যাডমিন থাকতে হবে</p>
					</div>
				</div>
			)}
		</Card>
	);
};

export default TeamManagement;
