import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import {
	socket,
	connectSocket,
	joinDashboardRoom,
	leaveDashboardRoom,
} from "../socket/socket";

const DashboardContext = createContext();

// Utility function to filter duplicate members based on email
const filterUniqueMembers = (members) => {
	return members.filter(
		(member, index, arr) =>
			arr.findIndex(
				(m) => m.email.toLowerCase() === member.email.toLowerCase()
			) === index
	);
};

export const DashboardProvider = ({ children }) => {
	const { user } = useAuth();
	const axiosPublic = useAxiosPublic();
	const [dashboards, setDashboards] = useState([]);
	const [activeDashboard, setActiveDashboard] = useState(null);
	const [dashboardTasks, setDashboardTasks] = useState([]);
	const [members, setMembers] = useState([]);
	const [invitations, setInvitations] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [onlineMembers, setOnlineMembers] = useState([]);

	// Fetch dashboards where the user is a member
	const fetchUserDashboards = async () => {
		if (!user?.email) return;

		try {
			setLoading(true);
			setError(null);
			const response = await axiosPublic.get(
				`/user-dashboards?email=${user.email}`
			);
			setDashboards(response.data);

			// Set active dashboard if none is selected but dashboards exist
			if (!activeDashboard && response.data.length > 0) {
				const firstDashboard = response.data[0];

				// Filter duplicate members before setting
				const uniqueMembers = filterUniqueMembers(firstDashboard.members || []);

				setActiveDashboard(firstDashboard);
				setMembers(uniqueMembers);
				fetchDashboardTasks(firstDashboard._id);
			}
		} catch (error) {
			console.error("Error fetching dashboards:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to fetch dashboards";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Fetch tasks for a specific dashboard
	const fetchDashboardTasks = useCallback(
		async (dashboardId) => {
			if (!dashboardId || !user?.email) {
				return;
			}

			try {
				setLoading(true);
				setError(null);
				const response = await axiosPublic.get(
					`/dashboard-tasks/${dashboardId}?email=${user.email}`
				);
				setDashboardTasks(response.data);
			} catch (error) {
				console.error("Error fetching dashboard tasks:", error);
				const errorMessage =
					error.response?.data?.message || "Failed to fetch tasks";
				setError(errorMessage);
				toast.error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[user?.email, axiosPublic]
	);

	// Create a new dashboard
	const createDashboard = async (dashboardData) => {
		if (!user) return false;

		try {
			setLoading(true);
			// Create the creator object with admin role
			const creatorWithRole = {
				uid: user.uid,
				email: user.email,
				name: user.displayName || user.email,
				photoURL: user.photoURL,
				role: "Admin", // Explicitly set the creator as Admin
			};

			const dashboardInfo = {
				...dashboardData,
				createdBy: creatorWithRole,
				members: [creatorWithRole], // Add the creator as a member with Admin role
			};

			const response = await axiosPublic.post("/dashboards", dashboardInfo);

			// Don't update local state here as socket event will handle it
			// setDashboards((prev) => [...prev, response.data]);

			setActiveDashboard(response.data);
			toast.success("Dashboard created successfully");
			return true;
		} catch (error) {
			console.error("Error creating dashboard:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to create dashboard";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Invite a user to a dashboard
	const inviteUser = async (dashboardId, invitedEmail, role = "Member") => {
		if (!user || !dashboardId) return false;

		try {
			setLoading(true);

			// Find the dashboard
			const dashboard = dashboards.find((d) => d._id === dashboardId);
			if (!dashboard) {
				throw new Error("Dashboard not found");
			}

			// Check if user is already a member of this dashboard
			const isAlreadyMember = dashboard.members.some(
				(member) => member.email.toLowerCase() === invitedEmail.toLowerCase()
			);

			if (isAlreadyMember) {
				toast.error(`${invitedEmail} is already a member of this dashboard`);
				return false;
			}

			const inviteData = {
				dashboardId,
				invitedEmail,
				role, // Include role in invitation
				dashboardName: dashboard.name,
				invitedBy: {
					uid: user.uid,
					email: user.email,
					name: user.displayName || user.email,
					photoURL: user.photoURL,
				},
			};

			await axiosPublic.post("/invite", inviteData);
			toast.success(`Invitation sent to ${invitedEmail}`);
			return true;
		} catch (error) {
			console.error("Error inviting user:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to invite user";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Create a task in the active dashboard
	const createDashboardTask = async (taskData) => {
		if (!user?.email || !activeDashboard?._id) {
			toast.error("No active dashboard selected");
			return false;
		}

		try {
			setLoading(true);
			const task = {
				...taskData,
				createdBy: {
					uid: user.uid,
					email: user.email,
					name: user.displayName || user.email,
					photoURL: user.photoURL,
				},
			};

			const response = await axiosPublic.post(
				`/dashboard-tasks/${activeDashboard._id}?email=${user.email}`,
				task
			);

			// Don't manually add to state - let socket event handle it
			// setDashboardTasks((prev) => [...prev, response.data]);
			toast.success("Task created successfully");
			return response.data; // Return the created task
		} catch (error) {
			console.error("Error creating task:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to create task";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Switch to a different dashboard
	const switchDashboard = (dashboard) => {
		if (dashboard && dashboard._id !== activeDashboard?._id) {
			// Filter duplicate members before setting
			const uniqueMembers = filterUniqueMembers(dashboard.members || []);

			setActiveDashboard(dashboard);
			setMembers(uniqueMembers);
			fetchDashboardTasks(dashboard._id);
		}
	};

	// Update dashboard name
	const updateDashboardName = async (dashboardId, newName) => {
		if (!user?.email || !dashboardId) {
			toast.error("Cannot update dashboard name");
			return false;
		}

		try {
			setLoading(true);
			const response = await axiosPublic.patch(
				`/dashboard-update/${dashboardId}?email=${user.email}`,
				{
					name: newName,
				}
			);

			if (response.data) {
				// Update dashboards list
				setDashboards((prev) =>
					prev.map((d) => (d._id === dashboardId ? { ...d, name: newName } : d))
				);

				// Update active dashboard if it's the one being changed
				if (activeDashboard && activeDashboard._id === dashboardId) {
					setActiveDashboard((prev) => ({ ...prev, name: newName }));
				}

				toast.success("Dashboard name updated successfully");
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error updating dashboard name:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to update dashboard name";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Handle when a member is promoted to an admin or demoted from admin
	const updateMemberRole = async (dashboardId, memberId, newRole) => {
		if (!user?.email || !dashboardId) {
			toast.error("Cannot update member role");
			return false;
		}

		try {
			setLoading(true);

			// Find the member in current members list
			const memberToUpdate = members.find(
				(m) => m._id === memberId || m.uid === memberId
			);
			if (!memberToUpdate) {
				toast.error("Member not found");
				return false;
			}

			// Simple payload with just the role for the backend
			const payload = {
				role: newRole,
			};

			const response = await axiosPublic.patch(
				`/dashboards/${dashboardId}/members/${memberToUpdate.email}?email=${user.email}`,
				payload
			);

			if (response.data) {
				// Update local state immediately for better UX
				setMembers((prev) =>
					prev.map((member) => {
						if (member._id === memberId || member.uid === memberId) {
							return { ...member, role: newRole };
						}
						return member;
					})
				);

				// Update dashboards list with the updated member role
				setDashboards((prev) =>
					prev.map((dashboard) => {
						if (dashboard._id === dashboardId) {
							return {
								...dashboard,
								members: dashboard.members.map((member) =>
									member._id === memberId || member.uid === memberId
										? { ...member, role: newRole }
										: member
								),
							};
						}
						return dashboard;
					})
				);

				// Update active dashboard if it's the one being changed
				if (activeDashboard && activeDashboard._id === dashboardId) {
					setActiveDashboard((prev) => ({
						...prev,
						members: prev.members.map((member) =>
							member._id === memberId || member.uid === memberId
								? { ...member, role: newRole }
								: member
						),
					}));
				}

				let successMessage = `Member role updated to ${newRole}`;
				toast.success(successMessage);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error updating member role:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to update member role";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Remove a member from a dashboard
	const removeMember = async (dashboardId, memberId) => {
		if (!user?.email || !dashboardId) {
			toast.error("Cannot remove member");
			return false;
		}

		try {
			setLoading(true);

			// Find the member in current members list
			const memberToRemove = members.find(
				(m) => m._id === memberId || m.uid === memberId
			);
			if (!memberToRemove) {
				toast.error("Member not found");
				return false;
			}

			// Prevent removing the last admin
			if (memberToRemove.role === "Admin") {
				const adminCount = members.filter((m) => m.role === "Admin").length;
				if (adminCount <= 1) {
					toast.error(
						"Cannot remove the last admin. At least one admin must remain."
					);
					return false;
				}
			}

			const response = await axiosPublic.delete(
				`/dashboards/${dashboardId}/members/${memberToRemove.email}?email=${user.email}`
			);

			if (response.data) {
				// Update local state immediately for better UX
				setMembers((prev) =>
					prev.filter(
						(member) => member._id !== memberId && member.uid !== memberId
					)
				);

				// Update the active dashboard members list
				if (activeDashboard && activeDashboard._id === dashboardId) {
					setActiveDashboard((prev) => ({
						...prev,
						members: prev.members.filter(
							(member) => member._id !== memberId && member.uid !== memberId
						),
					}));
				}

				// Update dashboards list
				setDashboards((prev) =>
					prev.map((dashboard) => {
						if (dashboard._id === dashboardId) {
							return {
								...dashboard,
								members: dashboard.members.filter(
									(member) => member._id !== memberId && member.uid !== memberId
								),
							};
						}
						return dashboard;
					})
				);

				toast.success("Member removed successfully");
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error removing member:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to remove member";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Delete a dashboard (only admins can delete)
	const deleteDashboard = async (dashboardId) => {
		if (!user?.email || !dashboardId) {
			toast.error("Cannot delete dashboard");
			return false;
		}

		try {
			setLoading(true);

			// Find the dashboard to get its name for confirmation
			const dashboard = dashboards.find((d) => d._id === dashboardId);
			if (!dashboard) {
				toast.error("Dashboard not found");
				return false;
			}

			// Check if user is admin
			const currentMember = dashboard.members.find(
				(m) => m.email === user.email
			);
			if (!currentMember || currentMember.role !== "Admin") {
				toast.error("Only admins can delete dashboards");
				return false;
			}

			const response = await axiosPublic.delete(
				`/dashboards/${dashboardId}?email=${user.email}`
			);

			if (response.data) {
				// Update local state immediately
				setDashboards((prev) => prev.filter((d) => d._id !== dashboardId));

				// If the deleted dashboard was active, switch to first available or clear
				if (activeDashboard && activeDashboard._id === dashboardId) {
					const remainingDashboards = dashboards.filter(
						(d) => d._id !== dashboardId
					);
					if (remainingDashboards.length > 0) {
						setActiveDashboard(remainingDashboards[0]);
						setMembers(remainingDashboards[0].members || []);
						fetchDashboardTasks(remainingDashboards[0]._id);
					} else {
						setActiveDashboard(null);
						setMembers([]);
						setDashboardTasks([]);
					}
				}

				toast.success(`Dashboard "${dashboard.name}" deleted successfully`);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error deleting dashboard:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to delete dashboard";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Accept an invitation (for the invitation page)
	const acceptInvitation = async (token, userInfo) => {
		try {
			setLoading(true);

			// Ensure the userInfo has the role property set as "Member"
			const userInfoWithRole = {
				...userInfo,
				role: userInfo.role || "Member", // Set role as "Member" if not already set
			};

			const response = await axiosPublic.post(`/accept-invite/${token}`, {
				userInfo: userInfoWithRole,
			});

			toast.success("Invitation accepted successfully");

			// Refresh dashboards after accepting invitation
			fetchUserDashboards();

			return response.data;
		} catch (error) {
			console.error("Error accepting invitation:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to accept invitation";
			toast.error(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	};

	// Socket event handling
	useEffect(() => {
		if (!socket || !user?.email) return;

		// Join user's personal room for dashboard events
		socket.emit("join_user_room", user.email);

		// Listen for new tasks in user's dashboards
		const handleDashboardTaskCreated = (task) => {
			// console.log("📝 Dashboard task created event received:", task);
			if (activeDashboard && task.dashboardId === activeDashboard._id) {
				setDashboardTasks((prev) => {
					// Check if this task already exists by _id
					const taskExists = prev.some(
						(existingTask) => existingTask._id === task._id
					);
					if (!taskExists) {
						// console.log("✅ Adding new task to dashboard:", task.title);
						return [...prev, task];
					} else {
						// console.log("⏭️ Task already exists, skipping:", task.title);
					}
					return prev;
				});
			}
		};

		// Listen for new team members
		const handleTeamMemberAdded = (data) => {
			// console.log("👥 Team member added event received:", data);
			// If this affects the active dashboard, refresh members
			if (activeDashboard && data.dashboardId === activeDashboard._id) {
				// Update members list if needed
				setMembers((prev) => {
					const memberExists = prev.some(
						(m) => m.email.toLowerCase() === data.member.email.toLowerCase()
					);
					if (!memberExists) {
						// console.log("✅ Adding new member:", data.member.email);
						const newMembers = [...prev, data.member];

						// Filter duplicates based on email
						const uniqueMembers = filterUniqueMembers(newMembers);

						return uniqueMembers;
					}
					return prev;
				});
			}

			// Refresh dashboards to include newly joined ones
			fetchUserDashboards();
		};

		// Listen for dashboard creation if user was invited during creation
		const handleDashboardCreated = (dashboard) => {
			const isUserMember = dashboard.members.some(
				(m) => m.email.toLowerCase() === user.email.toLowerCase()
			);

			if (isUserMember) {
				// Check if dashboard already exists to prevent duplicates
				setDashboards((prev) => {
					const existingDashboard = prev.find((d) => d._id === dashboard._id);
					if (existingDashboard) {
						return prev; // Don't add if already exists
					}
					return [...prev, dashboard];
				});
			}
		};

		// Listen for member role updates
		const handleMemberRoleUpdated = (data) => {
			// console.log("🔄 Member role updated event received:", data);
			if (activeDashboard && data.dashboardId === activeDashboard._id) {
				// console.log("✅ Updating member role in active dashboard");
				// Update members list - using email as primary identifier since it's more reliable
				setMembers((prev) =>
					prev.map((member) => {
						if (
							member.email === data.memberEmail ||
							member._id === data.memberId ||
							member.uid === data.memberId
						) {
							// console.log("🔄 Socket updating member:", member.email, "to role:", data.role);
							return { ...member, role: data.role };
						}
						return member;
					})
				);

				// Update active dashboard members
				setActiveDashboard((prev) => ({
					...prev,
					members: prev.members.map((member) => {
						if (
							member.email === data.memberEmail ||
							member._id === data.memberId ||
							member.uid === data.memberId
						) {
							return { ...member, role: data.role };
						}
						return member;
					}),
				}));

				// Update dashboards list
				setDashboards((prev) =>
					prev.map((dashboard) => {
						if (dashboard._id === data.dashboardId) {
							return {
								...dashboard,
								members: dashboard.members.map((member) => {
									if (
										member.email === data.memberEmail ||
										member._id === data.memberId ||
										member.uid === data.memberId
									) {
										return { ...member, role: data.role };
									}
									return member;
								}),
							};
						}
						return dashboard;
					})
				);
			}
		};

		// Listen for member removed
		const handleMemberRemoved = (data) => {
			console.log("🗑️ Member removed event received:", data);
			if (activeDashboard && data.dashboardId === activeDashboard._id) {
				console.log("✅ Removing member from active dashboard");
				// Remove from members list - using email as primary identifier
				setMembers((prev) =>
					prev.filter(
						(member) =>
							member.email !== data.memberEmail &&
							member._id !== data.memberId &&
							member.uid !== data.memberId
					)
				);

				// Update active dashboard members
				setActiveDashboard((prev) => ({
					...prev,
					members: prev.members.filter(
						(member) =>
							member.email !== data.memberEmail &&
							member._id !== data.memberId &&
							member.uid !== data.memberId
					),
				}));

				// Update dashboards list
				setDashboards((prev) =>
					prev.map((dashboard) => {
						if (dashboard._id === data.dashboardId) {
							return {
								...dashboard,
								members: dashboard.members.filter(
									(member) =>
										member.email !== data.memberEmail &&
										member._id !== data.memberId &&
										member.uid !== data.memberId
								),
							};
						}
						return dashboard;
					})
				);
			}
		};

		// Listen for task moves/updates in the dashboard
		const handleDashboardTaskUpdated = (data) => {
			console.log("📝 Dashboard task updated event received:", data);
			if (activeDashboard && data.dashboardId === activeDashboard._id) {
				console.log("✅ Updating task in active dashboard:", data.taskId);
				setDashboardTasks((prev) => {
					const existingTask = prev.find((task) => task._id === data.taskId);
					if (existingTask) {
						// Check if the update is different from current state
						const hasChanges = Object.keys(data.updates).some(
							(key) => existingTask[key] !== data.updates[key]
						);

						if (hasChanges) {
							console.log(
								"🔄 Socket update differs from local state, applying changes"
							);
							return prev.map((task) =>
								task._id === data.taskId ? { ...task, ...data.updates } : task
							);
						} else {
							console.log("⏭️ Socket update matches local state, skipping");
							return prev;
						}
					} else {
						console.log("❓ Task not found in local state");
						return prev;
					}
				});
			}
		};

		// Listen for task moves (drag and drop)
		const handleTaskMoved = (data) => {
			console.log("🔄 Task moved event received:", data);
			if (activeDashboard && data.dashboardId === activeDashboard._id) {
				console.log("✅ Moving task in real-time:", {
					taskId: data.taskId,
					from: data.previousCategory,
					to: data.newCategory,
				});
				setDashboardTasks((prev) =>
					prev.map((task) =>
						task._id === data.taskId
							? { ...task, category: data.newCategory }
							: task
					)
				);
			}
		};

		// Listen for online users updates
		const handleDashboardOnlineUsers = (data) => {
			if (activeDashboard && data.dashboardId === activeDashboard._id) {
				setOnlineMembers(data.onlineUsers);
			}
		};

		// Listen for dashboard deletion
		const handleDashboardDeleted = (data) => {
			console.log("🗑️ Dashboard deleted event received:", data);

			// Remove from dashboards list
			setDashboards((prev) => prev.filter((d) => d._id !== data.dashboardId));

			// If the deleted dashboard was active, switch to first available or clear
			if (activeDashboard && activeDashboard._id === data.dashboardId) {
				console.log("📋 Active dashboard was deleted, switching...");
				const remainingDashboards = dashboards.filter(
					(d) => d._id !== data.dashboardId
				);
				if (remainingDashboards.length > 0) {
					setActiveDashboard(remainingDashboards[0]);
					setMembers(remainingDashboards[0].members || []);
					fetchDashboardTasks(remainingDashboards[0]._id);
				} else {
					setActiveDashboard(null);
					setMembers([]);
					setDashboardTasks([]);
				}
			}

			// Show notification (only if current user didn't delete it)
			if (user?.email !== data.deletedBy) {
				toast.info(
					`Dashboard "${data.dashboardName}" was deleted by ${data.deletedBy}`
				);
			}
		};

		// console.log("📡 Registering socket event listeners");
		socket.on("dashboard_task_created", handleDashboardTaskCreated);
		socket.on("team_member_added", handleTeamMemberAdded);
		socket.on("dashboard_created", handleDashboardCreated);
		socket.on("dashboard_member_role_updated", handleMemberRoleUpdated);
		socket.on("dashboard_member_removed", handleMemberRemoved);
		socket.on("dashboard_task_updated", handleDashboardTaskUpdated);
		socket.on("task_moved", handleTaskMoved);
		socket.on("dashboard_online_users", handleDashboardOnlineUsers);
		socket.on("dashboard_deleted", handleDashboardDeleted);

		return () => {
			// console.log("📴 Unregistering socket event listeners");
			socket.off("dashboard_task_created", handleDashboardTaskCreated);
			socket.off("team_member_added", handleTeamMemberAdded);
			socket.off("dashboard_created", handleDashboardCreated);
			socket.off("dashboard_member_role_updated", handleMemberRoleUpdated);
			socket.off("dashboard_member_removed", handleMemberRemoved);
			socket.off("dashboard_task_updated", handleDashboardTaskUpdated);
			socket.off("task_moved", handleTaskMoved);
			socket.off("dashboard_online_users", handleDashboardOnlineUsers);
			socket.off("dashboard_deleted", handleDashboardDeleted);
		};
	}, [user, activeDashboard]);

	// Load user's dashboards when authenticated
	useEffect(() => {
		if (user?.email) {
			fetchUserDashboards();
		}
	}, [user?.email]);

	// Load dashboard members when active dashboard changes
	useEffect(() => {
		if (activeDashboard && user) {
			// console.log("🏠 Setting active dashboard:", activeDashboard.name);
			// console.log("👥 Dashboard members from dashboard object:", activeDashboard.members);

			// Filter duplicates and sync members from activeDashboard
			const uniqueMembers = filterUniqueMembers(activeDashboard.members || []);

			setMembers(uniqueMembers);
			// console.log("✅ Members state updated with", uniqueMembers?.length || 0, "unique members");

			// Prepare user info for socket
			const userInfo = {
				uid: user.uid,
				email: user.email,
				name: user.displayName || user.email,
				photoURL: user.photoURL,
			};

			// Join dashboard-specific socket room
			// console.log("🚪 Joining dashboard room:", activeDashboard._id);
			joinDashboardRoom(activeDashboard._id, userInfo);
		}

		// Cleanup function to leave the previous dashboard room
		return () => {
			if (activeDashboard) {
				// console.log("🚪 Leaving dashboard room:", activeDashboard._id);
				leaveDashboardRoom(activeDashboard._id);
			}
		};
	}, [activeDashboard, user]);

	// Additional effect to sync members when dashboard.members changes
	useEffect(() => {
		if (activeDashboard?.members) {
			// console.log("🔄 Dashboard members updated, syncing state:", activeDashboard.members);

			// Filter out duplicate members based on email (case-insensitive)
			const uniqueMembers = filterUniqueMembers(activeDashboard.members);

			// If duplicates were found, log them for debugging
			if (uniqueMembers.length !== activeDashboard.members.length) {
				console.log("🚨 Duplicate members found and filtered:", {
					original: activeDashboard.members.length,
					filtered: uniqueMembers.length,
					duplicates: activeDashboard.members.filter(
						(member, index, arr) =>
							arr.findIndex(
								(m) => m.email.toLowerCase() === member.email.toLowerCase()
							) !== index
					),
				});
			}

			setMembers(uniqueMembers);
		}
	}, [activeDashboard?.members]);

	const value = {
		dashboards,
		activeDashboard,
		dashboardTasks,
		members,
		onlineMembers,
		loading,
		error,
		createDashboard,
		deleteDashboard,
		inviteUser,
		createDashboardTask,
		switchDashboard,
		acceptInvitation,
		fetchDashboardTasks,
		setDashboardTasks,
		updateDashboardName,
		updateMemberRole,
		removeMember,
	};

	return (
		<DashboardContext.Provider value={value}>
			{children}
		</DashboardContext.Provider>
	);
};

export const useDashboard = () => {
	const context = useContext(DashboardContext);
	if (!context) {
		throw new Error("useDashboard must be used within a DashboardProvider");
	}
	return context;
};
