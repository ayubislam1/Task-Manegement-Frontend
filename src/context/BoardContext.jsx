import { createContext, useContext, useState, useEffect } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { socket } from "../socket/socket";

const BoardContext = createContext();

// Define board types
export const BOARD_TYPES = {
	PERSONAL: "personal",
	TEAM: "team",
	PROJECT: "project",
	DEPARTMENT: "department",
};

// Define permission levels
export const PERMISSION_LEVELS = {
	ADMIN: "admin", // Can do everything, including deleting the board
	MANAGER: "manager", // Can manage tasks and members but can't delete board
	CONTRIBUTOR: "contributor", // Can create/edit tasks but not manage members
	VIEWER: "viewer", // Read-only access
};

export const BoardProvider = ({ children }) => {
	const { user } = useAuth();
	const axiosPublic = useAxiosPublic();
	const [boards, setBoards] = useState([]);
	const [activeBoard, setActiveBoard] = useState(null);
	const [boardMembers, setBoardMembers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Fetch user's boards
	const fetchUserBoards = async () => {
		if (!user?.email) return;

		try {
			setLoading(true);
			setError(null);

			// First try to fetch using the expected endpoint
			try {
				const response = await axiosPublic.get(`/boards?email=${user.email}`);
				setBoards(response.data);

				// Set active board if none is selected but boards exist
				if (!activeBoard && response.data.length > 0) {
					setActiveBoard(response.data[0]);
				}
			} catch (error) {
				// If we get a 404, the endpoint might not exist yet on the backend
				if (error.response?.status === 404) {
					console.error(
						"Boards endpoint not found. Backend endpoint /boards needs to be implemented."
					);
					setBoards([]); // Set empty boards array to prevent further errors
					toast.error(
						"Boards feature is not available yet. Please contact the administrator."
					);
				} else {
					// For other errors, rethrow to be caught by the outer catch
					throw error;
				}
			}
		} catch (error) {
			console.error("Error fetching boards:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to fetch boards";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Create a new board
	const createBoard = async (boardData) => {
		if (!user) return false;

		try {
			setLoading(true);
			const boardInfo = {
				...boardData,
				createdBy: {
					uid: user.uid,
					email: user.email,
					name: user.displayName || user.email,
					photoURL: user.photoURL,
				},
				members: [
					{
						uid: user.uid,
						email: user.email,
						name: user.displayName || user.email,
						photoURL: user.photoURL,
						role: PERMISSION_LEVELS.ADMIN,
						joinedAt: new Date(),
					},
				],
				// Default to private for personal boards
				isPrivate:
					boardData.type === BOARD_TYPES.PERSONAL ? true : boardData.isPrivate,
			};

			const response = await axiosPublic.post("/boards", boardInfo);
			setBoards((prev) => [...prev, response.data]);
			setActiveBoard(response.data);
			toast.success("Board created successfully");
			return response.data;
		} catch (error) {
			console.error("Error creating board:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to create board";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Update board settings
	const updateBoard = async (boardId, updates) => {
		if (!user) return false;

		try {
			setLoading(true);

			// Check if user has permission to update board
			const board = boards.find((b) => b._id === boardId);
			if (!board) throw new Error("Board not found");

			const userMember = board.members.find((m) => m.uid === user.uid);
			if (
				!userMember ||
				![PERMISSION_LEVELS.ADMIN, PERMISSION_LEVELS.MANAGER].includes(
					userMember.role
				)
			) {
				throw new Error("You don't have permission to update this board");
			}

			const response = await axiosPublic.patch(`/boards/${boardId}`, updates);

			// Update local state
			setBoards((prev) =>
				prev.map((board) => (board._id === boardId ? response.data : board))
			);

			// Update active board if it's the one being modified
			if (activeBoard?._id === boardId) {
				setActiveBoard(response.data);
			}

			toast.success("Board updated successfully");
			return response.data;
		} catch (error) {
			console.error("Error updating board:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to update board";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Invite a user to a board
	const inviteUserToBoard = async (
		boardId,
		invitedEmail,
		role = PERMISSION_LEVELS.CONTRIBUTOR
	) => {
		if (!user || !boardId) return false;

		try {
			setLoading(true);

			// Find the board
			const board = boards.find((b) => b._id === boardId);
			if (!board) {
				throw new Error("Board not found");
			}

			// Check if user has permission to invite
			const userMember = board.members.find((m) => m.uid === user.uid);
			if (
				!userMember ||
				![PERMISSION_LEVELS.ADMIN, PERMISSION_LEVELS.MANAGER].includes(
					userMember.role
				)
			) {
				throw new Error(
					"You don't have permission to invite users to this board"
				);
			}

			const inviteData = {
				boardId,
				invitedEmail,
				boardName: board.name,
				role,
				invitedBy: {
					uid: user.uid,
					email: user.email,
					name: user.displayName || user.email,
					photoURL: user.photoURL,
				},
			};

			await axiosPublic.post("/board-invites", inviteData);
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

	// Change a user's role on a board
	const changeUserRole = async (boardId, userEmail, newRole) => {
		if (!user || !boardId) return false;

		try {
			setLoading(true);

			// Find the board
			const board = boards.find((b) => b._id === boardId);
			if (!board) {
				throw new Error("Board not found");
			}

			// Check if user has permission to change roles
			const userMember = board.members.find((m) => m.uid === user.uid);
			if (!userMember || userMember.role !== PERMISSION_LEVELS.ADMIN) {
				throw new Error(
					"You don't have permission to change user roles on this board"
				);
			}

			// Make API call to update the user's role
			const response = await axiosPublic.patch(`/boards/${boardId}/members`, {
				userEmail,
				newRole,
			});

			// Update local state
			setBoards((prev) =>
				prev.map((board) => (board._id === boardId ? response.data : board))
			);

			// Update active board if it's the one being modified
			if (activeBoard?._id === boardId) {
				setActiveBoard(response.data);
				setBoardMembers(response.data.members);
			}

			toast.success(`User role updated to ${newRole}`);
			return true;
		} catch (error) {
			console.error("Error changing user role:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to change user role";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Remove a user from a board
	const removeUserFromBoard = async (boardId, userEmail) => {
		if (!user || !boardId) return false;

		try {
			setLoading(true);

			// Check if user has permission to remove members
			const board = boards.find((b) => b._id === boardId);
			if (!board) throw new Error("Board not found");

			const userMember = board.members.find((m) => m.uid === user.uid);
			if (
				!userMember ||
				![PERMISSION_LEVELS.ADMIN, PERMISSION_LEVELS.MANAGER].includes(
					userMember.role
				)
			) {
				throw new Error(
					"You don't have permission to remove users from this board"
				);
			}

			// Make sure user isn't removing themselves if they're the only admin
			if (userEmail === user.email) {
				const adminCount = board.members.filter(
					(m) => m.role === PERMISSION_LEVELS.ADMIN
				).length;
				if (adminCount === 1 && userMember.role === PERMISSION_LEVELS.ADMIN) {
					throw new Error("Cannot remove yourself as you are the only admin");
				}
			}

			const response = await axiosPublic.delete(
				`/boards/${boardId}/members/${userEmail}`
			);

			// Update local state
			setBoards((prev) =>
				prev.map((board) => (board._id === boardId ? response.data : board))
			);

			// Update active board if it's the one being modified
			if (activeBoard?._id === boardId) {
				setActiveBoard(response.data);
				setBoardMembers(response.data.members);
			}

			toast.success("User removed from board");
			return true;
		} catch (error) {
			console.error("Error removing user from board:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to remove user";
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Switch active board
	const switchBoard = (boardId) => {
		const board = boards.find((b) => b._id === boardId);
		if (board) {
			setActiveBoard(board);
			setBoardMembers(board.members || []);

			// Join board-specific socket room
			if (socket) {
				socket.emit("join_board", boardId);
			}
		}
	};

	// Accept a board invitation
	const acceptBoardInvitation = async (token, userInfo) => {
		try {
			setLoading(true);
			const response = await axiosPublic.post(`/accept-board-invite/${token}`, {
				userInfo,
			});
			toast.success("Board invitation accepted successfully");

			// Refresh boards after accepting invitation
			fetchUserBoards();

			return response.data;
		} catch (error) {
			console.error("Error accepting board invitation:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to accept invitation";
			toast.error(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	};

	// Socket event handling for real-time updates
	useEffect(() => {
		if (!socket || !user?.email) return;

		// Listen for new boards shared with the user
		const handleBoardShared = (board) => {
			setBoards((prev) => {
				const boardExists = prev.some((b) => b._id === board._id);
				if (!boardExists) {
					return [...prev, board];
				}
				return prev;
			});

			toast.success(`You've been added to board: ${board.name}`);
		};

		// Listen for board updates
		const handleBoardUpdated = (updatedBoard) => {
			setBoards((prev) =>
				prev.map((board) =>
					board._id === updatedBoard._id ? updatedBoard : board
				)
			);

			// Update active board if it's the one being modified
			if (activeBoard?._id === updatedBoard._id) {
				setActiveBoard(updatedBoard);
				setBoardMembers(updatedBoard.members);
			}
		};

		// Listen for member removed event
		const handleMemberRemoved = (data) => {
			// If current user was removed from a board
			if (data.removedMemberEmail === user.email) {
				setBoards((prev) => prev.filter((board) => board._id !== data.boardId));

				// If active board is the one user was removed from, reset active board
				if (activeBoard?._id === data.boardId) {
					setActiveBoard(null);
					setBoardMembers([]);
				}

				toast.info(`You were removed from board: ${data.boardName}`);
			} else {
				// If another member was removed from a board the user is on
				setBoards((prev) =>
					prev.map((board) => {
						if (board._id === data.boardId) {
							return {
								...board,
								members: board.members.filter(
									(m) => m.email !== data.removedMemberEmail
								),
							};
						}
						return board;
					})
				);

				// Update active board if it's the one being modified
				if (activeBoard?._id === data.boardId) {
					setActiveBoard((prev) => ({
						...prev,
						members: prev.members.filter(
							(m) => m.email !== data.removedMemberEmail
						),
					}));

					setBoardMembers((prev) =>
						prev.filter((m) => m.email !== data.removedMemberEmail)
					);
				}
			}
		};

		socket.on("board_shared", handleBoardShared);
		socket.on("board_updated", handleBoardUpdated);
		socket.on("member_removed", handleMemberRemoved);

		return () => {
			socket.off("board_shared", handleBoardShared);
			socket.off("board_updated", handleBoardUpdated);
			socket.off("member_removed", handleMemberRemoved);
		};
	}, [user, activeBoard, socket]);

	// Load user's boards when authenticated
	useEffect(() => {
		if (user?.email) {
			fetchUserBoards();
		}
	}, [user?.email]);

	const value = {
		boards,
		activeBoard,
		boardMembers,
		loading,
		error,
		boardTypes: BOARD_TYPES,
		permissionLevels: PERMISSION_LEVELS,
		createBoard,
		updateBoard,
		inviteUserToBoard,
		changeUserRole,
		removeUserFromBoard,
		switchBoard,
		acceptBoardInvitation,
		fetchUserBoards,
	};

	return (
		<BoardContext.Provider value={value}>{children}</BoardContext.Provider>
	);
};

export const useBoard = () => {
	const context = useContext(BoardContext);
	if (!context) {
		throw new Error("useBoard must be used within a BoardProvider");
	}
	return context;
};
