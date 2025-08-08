import React from "react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../hooks/useAuth";

const DashboardDebugger = () => {
	const {
		dashboards,
		activeDashboard,
		members,
		onlineMembers,
		updateMemberRole,
		removeMember,
	} = useDashboard();
	const { user } = useAuth();

	const isCurrentUserAdmin = activeDashboard?.members?.some(
		(member) => member.email === user?.email && member.role === "Admin"
	);

	const testRoleChange = async () => {
		if (members.length > 0 && members[0].email !== user?.email) {
			const targetMember = members[0];
			const newRole = targetMember.role === "Admin" ? "Member" : "Admin";
			const success = await updateMemberRole(
				activeDashboard._id,
				targetMember._id || targetMember.uid,
				newRole
			);
			console.log("Role change result:", success);
		}
	};

	const testRemoveMember = async () => {
		if (members.length > 1) {
			const targetMember = members.find((m) => m.email !== user?.email);
			if (targetMember) {
				const success = await removeMember(
					activeDashboard._id,
					targetMember._id || targetMember.uid
				);
				console.log("Remove member result:", success);
			}
		}
	};

	return (
		<div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg mt-4">
			<h3 className="text-lg font-bold mb-4">Dashboard Debug Info</h3>

			<div className="space-y-4">
				<div>
					<strong>Current User:</strong> {user?.email} ({user?.displayName})
				</div>

				<div>
					<strong>Is Admin:</strong> {isCurrentUserAdmin ? "Yes" : "No"}
				</div>

				<div>
					<strong>Active Dashboard:</strong> {activeDashboard?.name || "None"}
				</div>

				<div>
					<strong>Members ({members.length}):</strong>
					<ul className="ml-4 mt-2">
						{members.map((member, index) => (
							<li key={member._id || member.uid || index} className="mb-1">
								{member.name || "No Name"} ({member.email}) -{" "}
								<strong>{member.role}</strong>
								{member.email === user?.email && " (YOU)"}
							</li>
						))}
					</ul>
				</div>

				<div>
					<strong>Online Members ({onlineMembers.length}):</strong>
					<ul className="ml-4 mt-2">
						{onlineMembers.map((member, index) => (
							<li key={index} className="mb-1">
								{member.name} ({member.email})
							</li>
						))}
					</ul>
				</div>

				{isCurrentUserAdmin && (
					<div className="space-x-2">
						<button
							onClick={testRoleChange}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Test Role Change
						</button>
						<button
							onClick={testRemoveMember}
							className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
						>
							Test Remove Member
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default DashboardDebugger;
