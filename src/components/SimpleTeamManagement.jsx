import React, { useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../hooks/useAuth";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { toast } from "react-hot-toast";

const SimpleTeamManagement = () => {
	const { activeDashboard, members, updateMemberRole, removeMember } =
		useDashboard();
	const { user } = useAuth();
	const [processing, setProcessing] = useState(false);

	// Check if current user is admin
	const isAdmin = activeDashboard?.members?.some(
		(member) => member.email === user?.email && member.role === "Admin"
	);

	const handleRoleChange = async (memberEmail, newRole) => {
		if (!isAdmin) {
			toast.error("Only admins can change roles");
			return;
		}

		if (memberEmail === user?.email) {
			toast.error("You cannot change your own role");
			return;
		}

		setProcessing(true);
		try {
			const member = members.find((m) => m.email === memberEmail);
			const success = await updateMemberRole(
				activeDashboard._id,
				member._id || member.uid,
				newRole
			);
			if (success) {
				toast.success(`Role updated to ${newRole}`);
			}
		} catch (error) {
			toast.error("Failed to update role");
		} finally {
			setProcessing(false);
		}
	};

	const handleRemoveMember = async (memberEmail) => {
		if (!isAdmin) {
			toast.error("Only admins can remove members");
			return;
		}

		if (memberEmail === user?.email) {
			toast.error("You cannot remove yourself");
			return;
		}

		if (window.confirm(`Remove ${memberEmail} from dashboard?`)) {
			setProcessing(true);
			try {
				const member = members.find((m) => m.email === memberEmail);
				const success = await removeMember(
					activeDashboard._id,
					member._id || member.uid
				);
				if (success) {
					toast.success("Member removed successfully");
				}
			} catch (error) {
				toast.error("Failed to remove member");
			} finally {
				setProcessing(false);
			}
		}
	};

	if (!activeDashboard) {
		return (
			<Card className="p-4">
				<p>No dashboard selected</p>
			</Card>
		);
	}

	if (!members || members.length === 0) {
		return (
			<Card className="p-4">
				<h3 className="font-semibold mb-2">Team Management</h3>
				<p>
					No members found. Dashboard has {activeDashboard.members?.length || 0}{" "}
					members in data.
				</p>
			</Card>
		);
	}

	return (
		<Card className="p-6">
			<h3 className="text-xl font-semibold mb-4">Team Management</h3>

			{!isAdmin && (
				<div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
					<p className="text-yellow-800">
						You are not an admin. You can only view team members.
					</p>
				</div>
			)}

			<div className="space-y-4">
				{members.map((member) => (
					<div
						key={member._id || member.uid || member.email}
						className="flex items-center justify-between p-3 border rounded"
					>
						<div>
							<p className="font-medium">{member.name || member.email}</p>
							<p className="text-sm text-gray-500">{member.email}</p>
							<span
								className={`inline-block px-2 py-1 text-xs rounded ${
									member.role === "Admin"
										? "bg-red-100 text-red-800"
										: "bg-blue-100 text-blue-800"
								}`}
							>
								{member.role}
							</span>
						</div>

						{isAdmin && member.email !== user?.email && (
							<div className="flex gap-2">
								<Select
									value={member.role}
									onValueChange={(newRole) =>
										handleRoleChange(member.email, newRole)
									}
									disabled={processing}
								>
									<SelectTrigger className="w-32">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Admin">Admin</SelectItem>
										<SelectItem value="Member">Member</SelectItem>
									</SelectContent>
								</Select>

								<Button
									variant="destructive"
									size="sm"
									onClick={() => handleRemoveMember(member.email)}
									disabled={processing}
								>
									Remove
								</Button>
							</div>
						)}
					</div>
				))}
			</div>
		</Card>
	);
};

export default SimpleTeamManagement;
