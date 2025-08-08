import React from "react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../hooks/useAuth";

const TeamDebugger = () => {
	const { user } = useAuth();
	const { activeDashboard, members, onlineMembers, dashboards } =
		useDashboard();

	const isCurrentUserAdmin =
		activeDashboard?.members?.find((member) => member.email === user?.email)
			?.role === "Admin";

	return (
		<div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
			<h3 className="font-bold text-lg mb-3 text-red-800">
				🔍 Team Management Debug
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
				<div className="bg-white p-3 rounded border">
					<h4 className="font-semibold text-blue-600 mb-2">👤 User Info</h4>
					<p>
						<strong>Email:</strong> {user?.email || "Not logged in"}
					</p>
					<p>
						<strong>Name:</strong> {user?.displayName || "No name"}
					</p>
					<p>
						<strong>Is Admin:</strong>{" "}
						<span
							className={isCurrentUserAdmin ? "text-green-600" : "text-red-600"}
						>
							{isCurrentUserAdmin ? "✅ YES" : "❌ NO"}
						</span>
					</p>
				</div>

				<div className="bg-white p-3 rounded border">
					<h4 className="font-semibold text-green-600 mb-2">
						🏠 Dashboard Info
					</h4>
					<p>
						<strong>Name:</strong> {activeDashboard?.name || "None selected"}
					</p>
					<p>
						<strong>ID:</strong> {activeDashboard?._id || "No ID"}
					</p>
					<p>
						<strong>Has Dashboard:</strong>{" "}
						<span
							className={activeDashboard ? "text-green-600" : "text-red-600"}
						>
							{activeDashboard ? "✅ YES" : "❌ NO"}
						</span>
					</p>
				</div>

				<div className="bg-white p-3 rounded border">
					<h4 className="font-semibold text-purple-600 mb-2">
						👥 Members Analysis
					</h4>
					<p>
						<strong>Members Array Length:</strong>{" "}
						<span
							className={
								members?.length > 0 ? "text-green-600" : "text-red-600"
							}
						>
							{members?.length || 0}
						</span>
					</p>
					<p>
						<strong>Dashboard.members Length:</strong>{" "}
						<span
							className={
								activeDashboard?.members?.length > 0
									? "text-green-600"
									: "text-red-600"
							}
						>
							{activeDashboard?.members?.length || 0}
						</span>
					</p>
					<p>
						<strong>Online Members:</strong> {onlineMembers?.length || 0}
					</p>
				</div>

				<div className="bg-white p-3 rounded border">
					<h4 className="font-semibold text-orange-600 mb-2">
						📊 Context Status
					</h4>
					<p>
						<strong>Total Dashboards:</strong> {dashboards?.length || 0}
					</p>
					<p>
						<strong>Members State Type:</strong>{" "}
						{Array.isArray(members) ? "Array" : typeof members}
					</p>
					<p>
						<strong>Dashboard Members Type:</strong>{" "}
						{Array.isArray(activeDashboard?.members)
							? "Array"
							: typeof activeDashboard?.members}
					</p>
				</div>
			</div>

			<div className="mt-4 p-3 bg-white rounded border">
				<h4 className="font-semibold text-gray-800 mb-2">
					📋 Detailed Members Data
				</h4>

				<div className="mb-3">
					<strong className="text-blue-600">Context Members State:</strong>
					{members && members.length > 0 ? (
						<ul className="text-xs mt-1 space-y-1">
							{members.map((member, index) => (
								<li
									key={index}
									className="flex justify-between items-center p-1 bg-blue-50 rounded"
								>
									<span>{member.name || member.email || "No name/email"}</span>
									<span
										className={`px-2 py-1 rounded text-xs ${
											member.role === "Admin"
												? "bg-red-100 text-red-800"
												: "bg-green-100 text-green-800"
										}`}
									>
										{member.role || "No role"}
									</span>
								</li>
							))}
						</ul>
					) : (
						<p className="text-red-600 text-xs mt-1">❌ No members in state</p>
					)}
				</div>

				<div>
					<strong className="text-green-600">Dashboard.members Data:</strong>
					{activeDashboard?.members && activeDashboard.members.length > 0 ? (
						<ul className="text-xs mt-1 space-y-1">
							{activeDashboard.members.map((member, index) => (
								<li
									key={index}
									className="flex justify-between items-center p-1 bg-green-50 rounded"
								>
									<span>{member.name || member.email || "No name/email"}</span>
									<span
										className={`px-2 py-1 rounded text-xs ${
											member.role === "Admin"
												? "bg-red-100 text-red-800"
												: "bg-blue-100 text-blue-800"
										}`}
									>
										{member.role || "No role"}
									</span>
								</li>
							))}
						</ul>
					) : (
						<p className="text-red-600 text-xs mt-1">
							❌ No members in dashboard
						</p>
					)}
				</div>
			</div>

			<div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-300">
				<h4 className="font-semibold text-yellow-800 mb-2">⚠️ Issues Found:</h4>
				<ul className="text-sm text-yellow-700 space-y-1">
					{!user?.email && <li>• User not logged in</li>}
					{!activeDashboard && <li>• No active dashboard selected</li>}
					{!members?.length && activeDashboard?.members?.length && (
						<li>
							• <strong>MAIN ISSUE:</strong> Dashboard has{" "}
							{activeDashboard.members.length} members but context state has{" "}
							{members?.length || 0}
						</li>
					)}
					{!isCurrentUserAdmin && activeDashboard && (
						<li>• Current user is not admin - won't see management options</li>
					)}
					{members?.length === 0 && activeDashboard?.members?.length === 0 && (
						<li>• Both dashboard and state have no members</li>
					)}
				</ul>
			</div>
		</div>
	);
};

export default TeamDebugger;
