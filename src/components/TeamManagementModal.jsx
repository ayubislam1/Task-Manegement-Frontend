import React, { useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../hooks/useAuth";
import {
	Shield,
	User,
	UserMinus,
	UserPlus,
	Mail,
	X,
	AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const TeamManagementModal = ({
	dashboardId,
	isOpen,
	onClose,
	isCurrentUserAdmin: propIsAdmin,
	activeDashboard: propActiveDashboard,
	members: propMembers,
}) => {
	const { user } = useAuth();
	const {
		activeDashboard: contextActiveDashboard,
		members: contextMembers,
		updateMemberRole,
		removeMember,
		inviteUser,
	} = useDashboard();

	// Use props first, fallback to context
	const activeDashboard = propActiveDashboard || contextActiveDashboard;
	const members = propMembers || contextMembers;
	const [selectedMember, setSelectedMember] = useState(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [confirmAction, setConfirmAction] = useState(null);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("members");

	// Email invitation states
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("Member");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Use prop admin status first, fallback to local check
	const isCurrentUserAdmin =
		propIsAdmin !== undefined
			? propIsAdmin
			: activeDashboard?.members?.some(
					(member) => member.email === user?.email && member.role === "Admin"
			  );

	// Handle role change
	const handleRoleChange = (memberId, newRole) => {
		const member = members.find((m) => (m.uid || m._id) === memberId);
		if (!member) return;

		// If trying to change to the same role, do nothing
		if (member.role === newRole) return;

		setSelectedMember(member);
		setConfirmAction(
			newRole === "Admin" ? "promoteToAdmin" : "demoteFromAdmin"
		);
		setShowConfirmDialog(true);
	};

	// Handle removing member
	const handleRemoveMember = (memberId) => {
		const member = members.find((m) => (m.uid || m._id) === memberId);
		if (!member) return;

		setSelectedMember(member);
		setConfirmAction("removeMember");
		setShowConfirmDialog(true);
	};

	// Handle sending invitation
	const handleSendInvitation = async (e) => {
		e.preventDefault();

		if (!email.trim()) {
			toast.error("Please enter an email address");
			return;
		}

		setIsSubmitting(true);

		try {
			const success = await inviteUser(dashboardId, email.trim(), role);
			if (success) {
				setEmail("");
				toast.success(`Invitation sent to ${email} as ${role}`);
			}
		} catch (error) {
			console.error("Error inviting user:", error);
			toast.error("Failed to send invitation");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Confirm action (role change or member removal)
	const confirmActionHandler = async () => {
		if (!selectedMember) return;

		// Use uid if available, otherwise use _id
		const memberId = selectedMember.uid || selectedMember._id;
		const newRole = confirmAction === "promoteToAdmin" ? "Admin" : "Member";

		try {
			setLoading(true);

			if (
				confirmAction === "promoteToAdmin" ||
				confirmAction === "demoteFromAdmin"
			) {
				await updateMemberRole(dashboardId, memberId, newRole);
				toast.success(`Member role updated to ${newRole}`);
			} else if (confirmAction === "removeMember") {
				await removeMember(dashboardId, memberId);
				toast.success("Member removed successfully");
			}

			setShowConfirmDialog(false);
			setSelectedMember(null);
		} catch (error) {
			console.error("Error performing action:", error);
			toast.error("Failed to complete the action");
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
					<div className="flex items-center gap-3">
						<h2 className="text-xl font-semibold">Team Management</h2>
						{isCurrentUserAdmin && (
							<span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full flex items-center">
								<Shield className="h-3 w-3 mr-1" />
								Admin
							</span>
						)}
					</div>
					<button
						onClick={onClose}
						className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Tabs */}
				<div className="border-b border-gray-200 dark:border-gray-700">
					<div className="flex">
						<button
							className={`px-4 py-2 ${
								activeTab === "members"
									? "border-b-2 border-indigo-500 text-indigo-600"
									: "text-gray-500 hover:text-gray-700"
							}`}
							onClick={() => setActiveTab("members")}
						>
							<div className="flex items-center">
								<User className="h-4 w-4 mr-2" />
								Team Members
							</div>
						</button>
						{isCurrentUserAdmin && (
							<button
								className={`px-4 py-2 ${
									activeTab === "invite"
										? "border-b-2 border-indigo-500 text-indigo-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => setActiveTab("invite")}
							>
								<div className="flex items-center">
									<UserPlus className="h-4 w-4 mr-2" />
									Invite Members
								</div>
							</button>
						)}
					</div>
				</div>

				<div className="overflow-y-auto max-h-[calc(90vh-120px)]">
					{/* Team Members Tab */}
					{activeTab === "members" && (
						<div className="p-4">
							{isCurrentUserAdmin && (
								<div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-md">
									<p className="text-sm text-blue-800 dark:text-blue-300 flex items-center">
										<Shield className="h-4 w-4 mr-2 text-blue-500" />
										As an admin, you can change member roles or remove members
										using the buttons on the right.
									</p>
								</div>
							)}
							<div className="space-y-3">
								{members && members.length > 0 ? (
									members.map((member) => {
										const isCurrentUser = member.email === user?.email;
										const memberId = member.uid || member._id;

										return (
											<div
												key={memberId}
												className={`flex items-center justify-between p-3 rounded-md ${
													isCurrentUser
														? "bg-indigo-50 dark:bg-indigo-900/20"
														: "bg-gray-50 dark:bg-gray-700/50"
												}`}
											>
												<div className="flex items-center gap-3">
													{member.photoURL ? (
														<img
															src={member.photoURL}
															alt={member.name || member.email}
															className="w-10 h-10 rounded-full"
														/>
													) : (
														<div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
															{(member.name || member.email || "A")
																.charAt(0)
																.toUpperCase()}
														</div>
													)}

													<div>
														<div className="flex items-center gap-2">
															<span className="font-medium">
																{member.name || member.email}
															</span>
															{isCurrentUser && (
																<span className="bg-gray-100 dark:bg-gray-600 text-xs px-2 py-0.5 rounded-full">
																	You
																</span>
															)}
														</div>
														<div className="text-sm text-gray-500">
															{member.email}
														</div>
													</div>
												</div>

												<div className="flex items-center gap-3">
													<span
														className={`px-2 py-1 text-xs rounded-full flex items-center ${
															member.role === "Admin"
																? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
																: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
														}`}
													>
														{member.role === "Admin" ? (
															<>
																<Shield className="h-3 w-3 mr-1" />
																Admin
															</>
														) : (
															<>
																<User className="h-3 w-3 mr-1" />
																Member
															</>
														)}
													</span>

													{isCurrentUserAdmin && !isCurrentUser && (
														<div className="flex gap-2">
															{member.role !== "Admin" ? (
																<button
																	onClick={() =>
																		handleRoleChange(memberId, "Admin")
																	}
																	className="py-1 px-2 text-xs bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 rounded flex items-center"
																	title="Make Admin"
																>
																	<Shield className="h-3 w-3 mr-1" />
																	Make Admin
																</button>
															) : (
																<button
																	onClick={() =>
																		handleRoleChange(memberId, "Member")
																	}
																	className="py-1 px-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded flex items-center"
																	title="Remove Admin"
																>
																	<User className="h-3 w-3 mr-1" />
																	Remove Admin
																</button>
															)}

															<button
																onClick={() => handleRemoveMember(memberId)}
																className="py-1 px-2 text-xs bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded flex items-center"
																title="Remove Member"
															>
																<UserMinus className="h-3 w-3 mr-1" />
																Remove
															</button>
														</div>
													)}
												</div>
											</div>
										);
									})
								) : (
									<div className="text-center py-8 text-gray-500">
										<User className="h-12 w-12 mx-auto mb-2 opacity-30" />
										<p>No team members yet</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Invite Members Tab */}
					{activeTab === "invite" && isCurrentUserAdmin && (
						<div className="p-4">
							{/* Invite Form */}
							<div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
								<h3 className="text-lg font-medium mb-3 flex items-center">
									<UserPlus className="mr-2 h-5 w-5 text-indigo-500" />
									Invite New Member
								</h3>

								<form onSubmit={handleSendInvitation} className="space-y-4">
									<div>
										<label className="block text-sm font-medium mb-1">
											Email Address
										</label>
										<input
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder="colleague@example.com"
											className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium mb-1">
											Role
										</label>
										<div className="grid grid-cols-2 gap-2">
											<button
												type="button"
												className={`py-2 px-3 border rounded-md flex items-center ${
													role === "Member"
														? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
														: "border-gray-300 dark:border-gray-600"
												}`}
												onClick={() => setRole("Member")}
											>
												<User className="h-4 w-4 mr-2" />
												<span>Member</span>
											</button>
											<button
												type="button"
												className={`py-2 px-3 border rounded-md flex items-center ${
													role === "Admin"
														? "bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
														: "border-gray-300 dark:border-gray-600"
												}`}
												onClick={() => setRole("Admin")}
											>
												<Shield className="h-4 w-4 mr-2" />
												<span>Admin</span>
											</button>
										</div>
									</div>

									<button
										type="submit"
										disabled={isSubmitting || !email.trim()}
										className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-md flex items-center justify-center"
									>
										{isSubmitting ? (
											<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
										) : (
											<>
												<Mail className="h-4 w-4 mr-2" />
												Send Invitation
											</>
										)}
									</button>
								</form>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Confirmation Dialog */}
			{showConfirmDialog && selectedMember && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white dark:bg-gray-800 p-5 rounded-lg w-96">
						<h3 className="text-lg font-medium mb-3">
							{confirmAction === "promoteToAdmin" && "Promote to Admin?"}
							{confirmAction === "demoteFromAdmin" && "Remove Admin Role?"}
							{confirmAction === "removeMember" && "Remove Team Member?"}
						</h3>

						<div className="mb-4 flex items-center gap-3">
							{selectedMember.photoURL ? (
								<img
									src={selectedMember.photoURL}
									alt={selectedMember.name || selectedMember.email}
									className="w-10 h-10 rounded-full"
								/>
							) : (
								<div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
									{(selectedMember.name || selectedMember.email || "A")
										.charAt(0)
										.toUpperCase()}
								</div>
							)}
							<div>
								<p className="font-medium">
									{selectedMember.name || selectedMember.email}
								</p>
								<p className="text-sm text-gray-500">{selectedMember.email}</p>
							</div>
						</div>

						{confirmAction === "promoteToAdmin" && (
							<div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-md flex items-start">
								<AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
								<div className="text-sm text-yellow-800 dark:text-yellow-300">
									<p className="font-medium mb-1">
										You are about to grant admin privileges to this member.
									</p>
									<p>Admins can:</p>
									<ul className="list-disc pl-5 mt-1 space-y-0.5">
										<li>Change member roles</li>
										<li>Remove members from the dashboard</li>
										<li>Manage dashboard settings</li>
									</ul>
								</div>
							</div>
						)}

						{confirmAction === "demoteFromAdmin" && (
							<div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-md flex items-start">
								<AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
								<div className="text-sm text-yellow-800 dark:text-yellow-300">
									<p className="font-medium mb-1">
										You are about to remove admin privileges from this member.
									</p>
									<p>After this change, they will no longer be able to:</p>
									<ul className="list-disc pl-5 mt-1 space-y-0.5">
										<li>Change member roles</li>
										<li>Remove members from the dashboard</li>
										<li>Manage dashboard settings</li>
									</ul>
								</div>
							</div>
						)}

						{confirmAction === "removeMember" && (
							<div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-md flex items-start">
								<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 mr-2 flex-shrink-0" />
								<div className="text-sm text-red-800 dark:text-red-300">
									<p className="font-medium mb-1">
										You are about to remove this member from the team.
									</p>
									<p>This action will:</p>
									<ul className="list-disc pl-5 mt-1 space-y-0.5">
										<li>Remove their access to this dashboard</li>
										<li>Prevent them from viewing or editing any tasks</li>
										<li>Remove them from all assigned tasks</li>
									</ul>
									<p className="mt-2 font-medium">
										This action cannot be undone.
									</p>
								</div>
							</div>
						)}

						<div className="flex justify-between">
							<button
								onClick={() => setShowConfirmDialog(false)}
								className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
							>
								Cancel
							</button>
							<button
								onClick={confirmActionHandler}
								disabled={loading}
								className={`px-4 py-2 text-white rounded-md ${
									confirmAction === "removeMember"
										? "bg-red-600 hover:bg-red-700"
										: confirmAction === "promoteToAdmin"
										? "bg-purple-600 hover:bg-purple-700"
										: "bg-blue-600 hover:bg-blue-700"
								}`}
							>
								{loading ? (
									<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
								) : (
									<>
										{confirmAction === "promoteToAdmin" && (
											<>
												<Shield className="h-4 w-4 mr-2 inline" />
												Make Admin
											</>
										)}
										{confirmAction === "demoteFromAdmin" && (
											<>
												<User className="h-4 w-4 mr-2 inline" />
												Remove Admin
											</>
										)}
										{confirmAction === "removeMember" && (
											<>
												<UserMinus className="h-4 w-4 mr-2 inline" />
												Remove Member
											</>
										)}
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TeamManagementModal;
