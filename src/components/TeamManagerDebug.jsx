import React from "react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../hooks/useAuth";
import { Card } from "./ui/card";

const TeamManagerDebug = () => {
	const { activeDashboard, members, loading } = useDashboard();
	const { user } = useAuth();

	return (
		<Card className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
			<h4 className="font-semibold text-lg mb-3 text-blue-600">
				🔍 Team Manager Debug Info
			</h4>

			<div className="space-y-3 text-sm">
				<div>
					<strong>Current User:</strong> {user?.email || "Not logged in"}
				</div>

				<div>
					<strong>Active Dashboard:</strong>{" "}
					{activeDashboard?.name || "None selected"}
				</div>

				<div>
					<strong>Dashboard ID:</strong> {activeDashboard?._id || "N/A"}
				</div>

				<div>
					<strong>Members Count:</strong> {members?.length || 0}
				</div>

				<div>
					<strong>Loading State:</strong> {loading ? "Yes" : "No"}
				</div>

				{activeDashboard && (
					<div>
						<strong>Dashboard Members:</strong>
						<div className="ml-4 mt-2">
							{activeDashboard.members?.map((member, index) => (
								<div key={index} className="p-2 bg-white rounded border mb-1">
									<div>
										<strong>Email:</strong> {member.email}
									</div>
									<div>
										<strong>Role:</strong> {member.role}
									</div>
									<div>
										<strong>Name:</strong> {member.name || "N/A"}
									</div>
								</div>
							)) || "No members in dashboard object"}
						</div>
					</div>
				)}

				{members && members.length > 0 && (
					<div>
						<strong>Members State:</strong>
						<div className="ml-4 mt-2">
							{members.map((member, index) => (
								<div key={index} className="p-2 bg-white rounded border mb-1">
									<div>
										<strong>Email:</strong> {member.email}
									</div>
									<div>
										<strong>Role:</strong> {member.role}
									</div>
									<div>
										<strong>Name:</strong> {member.name || "N/A"}
									</div>
									<div>
										<strong>ID:</strong> {member._id || member.uid || "N/A"}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{user && activeDashboard && (
					<div>
						<strong>Current User Admin Status:</strong>
						{(() => {
							const isAdmin = activeDashboard?.members?.some(
								(member) =>
									member.email === user?.email && member.role === "Admin"
							);
							return isAdmin ? "✅ Admin" : "❌ Not Admin";
						})()}
					</div>
				)}
			</div>
		</Card>
	);
};

export default TeamManagerDebug;
