import { io } from "socket.io-client";

const SOCKET_URL =
	import.meta.env.MODE === "development"
		? "http://localhost:5000"
		: "https://task-management-backend.vercel.app"; // Update this to your production backend URL

export const socket = io(SOCKET_URL, {
	autoConnect: false,
	reconnection: true,
	reconnectionAttempts: Infinity,
	reconnectionDelay: 1000,
	reconnectionDelayMax: 5000,
	timeout: 20000,
	transports: ["websocket", "polling"],
});

let reconnectTimer = null;
let taskRooms = new Set();
let dashboardRooms = new Set();
// Track active users in tasks
export const activeTaskUsers = new Map();

export const connectSocket = (userId, userEmail) => {
	if (!socket.connected) {
		try {
			if (reconnectTimer) {
				clearTimeout(reconnectTimer);
				reconnectTimer = null;
			}

			socket.auth = { userId, userEmail };
			socket.connect();

			socket.on("connect", () => {
				console.log("🔗 Connected to WebSocket server with ID:", socket.id);

				// Rejoin all task rooms after reconnection
				taskRooms.forEach((taskId) => {
					socket.emit("join_task", taskId);
				});

				// Rejoin all dashboard rooms after reconnection
				dashboardRooms.forEach((dashboardId) => {
					socket.emit("join_dashboard", dashboardId);
				});

				// Join user's personal room for targeted notifications
				if (userEmail) {
					socket.emit("join_user_room", userEmail);
				}

				if (reconnectTimer) {
					clearTimeout(reconnectTimer);
					reconnectTimer = null;
				}
			});

			socket.on("connect_error", (error) => {
				console.error("WebSocket connection error:", error);
				if (!reconnectTimer) {
					reconnectTimer = setTimeout(() => {
						console.log("Attempting to reconnect...");
						socket.connect();
					}, 2000);
				}
			});

			socket.on("disconnect", (reason) => {
				console.log("Disconnected from WebSocket server:", reason);
				if (reason === "io client disconnect" || reason === "transport close") {
					if (!reconnectTimer) {
						reconnectTimer = setTimeout(() => {
							console.log("Attempting to reconnect...");
							socket.connect();
						}, 2000);
					}
				}
			});

			// Task events with optimistic updates
			socket.on("task_updated", ({ taskId, updates }) => {
				console.log("Task updated:", taskId, updates);
			});

			socket.on(
				"task_status_changed",
				({ taskId, newStatus, previousStatus }) => {
					console.log(
						"Task status changed:",
						taskId,
						newStatus,
						previousStatus
					);
				}
			);

			socket.on("task_deleted", (taskId) => {
				console.log("Task deleted:", taskId);
				// Remove from tracked rooms if deleted
				taskRooms.delete(taskId);
				// Clear active users for this task
				activeTaskUsers.delete(taskId);
			});

			// New task created event
			socket.on("new_task", (task) => {
				console.log("New task created:", task);
			});

			// Dashboard-specific task events
			socket.on("dashboard_task_created", (task) => {
				console.log("New dashboard task created:", task);
			});

			socket.on("dashboard_task_updated", (data) => {
				console.log("Dashboard task updated:", data);
			});

			socket.on("task_moved", (data) => {
				console.log("🔄 Task moved event received:", {
					taskId: data.taskId,
					from: data.previousCategory,
					to: data.newCategory,
					dashboardId: data.dashboardId,
				});
			});

			// User collaboration events
			socket.on("user_joined_task", ({ taskId, user }) => {
				if (!activeTaskUsers.has(taskId)) {
					activeTaskUsers.set(taskId, new Map());
				}
				activeTaskUsers.get(taskId).set(user.id, user);
				console.log(`User ${user.name} joined task ${taskId}`);
			});

			socket.on("user_left_task", ({ taskId, userId }) => {
				if (activeTaskUsers.has(taskId)) {
					activeTaskUsers.get(taskId).delete(userId);
					if (activeTaskUsers.get(taskId).size === 0) {
						activeTaskUsers.delete(taskId);
					}
				}
				console.log(`User ${userId} left task ${taskId}`);
			});

			socket.on("active_task_users", ({ taskId, users }) => {
				activeTaskUsers.set(taskId, new Map(Object.entries(users)));
				console.log(`Active users in task ${taskId}:`, users);
			});

			// Dashboard events
			socket.on("dashboard_created", (dashboard) => {
				console.log("New dashboard created:", dashboard);
			});

			// Board events
			socket.on("board_created", (board) => {
				console.log("New board created:", board);
			});

			// Team events
			socket.on("team_member_added", ({ dashboardId, member }) => {
				console.log(
					`New team member added to dashboard ${dashboardId}:`,
					member
				);
			});
		} catch (error) {
			console.error("Socket connection failed:", error);
			if (!reconnectTimer) {
				reconnectTimer = setTimeout(() => {
					console.log("Attempting to reconnect after error...");
					connectSocket(userId, userEmail);
				}, 2000);
			}
		}
	}
};

export const joinTaskRoom = (taskId) => {
	if (!taskId) return;

	taskRooms.add(taskId);
	if (socket.connected) {
		socket.emit("join_task", taskId);
	}
};

export const leaveTaskRoom = (taskId) => {
	if (!taskId) return;

	taskRooms.delete(taskId);
	if (socket.connected) {
		socket.emit("leave_task", taskId);
	}
};

export const joinDashboardRoom = (dashboardId, userInfo) => {
	if (!dashboardId) return;

	dashboardRooms.add(dashboardId);
	if (socket.connected && userInfo) {
		socket.emit("join_dashboard", dashboardId, userInfo);
	}
};

export const leaveDashboardRoom = (dashboardId) => {
	if (!dashboardId) return;

	dashboardRooms.delete(dashboardId);
	if (socket.connected) {
		socket.emit("leave_dashboard", dashboardId);
	}
};

export const disconnectSocket = () => {
	if (socket.connected) {
		try {
			taskRooms.clear();
			dashboardRooms.clear();
			if (reconnectTimer) {
				clearTimeout(reconnectTimer);
				reconnectTimer = null;
			}
			socket.disconnect();
		} catch (error) {
			console.error("Socket disconnect failed:", error);
		}
	}
};

// Helper function to get active users for a task
export const getActiveTaskUsers = (taskId) => {
	return activeTaskUsers.has(taskId)
		? Array.from(activeTaskUsers.get(taskId).values())
		: [];
};

export default socket;
