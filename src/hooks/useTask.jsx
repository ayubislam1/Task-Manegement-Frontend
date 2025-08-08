import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { toast } from "react-hot-toast";
import { socket } from "../socket/socket";
import { useEffect, useState } from "react";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const useTask = () => {
	const axiosPublic = useAxiosPublic();
	const queryClient = useQueryClient();
	const [retryCount, setRetryCount] = useState(0);

	useEffect(() => {
		const handleSocketEvent = async (eventType, handler) => {
			try {
				await handler();
			} catch (error) {
				console.error(`Error handling ${eventType}:`, error);
				if (retryCount < MAX_RETRIES) {
					setTimeout(() => {
						setRetryCount((prev) => prev + 1);
						handler();
					}, RETRY_DELAY * Math.pow(2, retryCount));
				} else {
					toast.error(`Failed to sync ${eventType}. Please refresh the page.`);
				}
			}
		};

		const handleTaskUpdate = ({ taskId, updates }) => {
			handleSocketEvent("task_update", () => {
				queryClient.setQueryData(["tasks"], (oldTasks) => {
					if (!oldTasks) return oldTasks;
					return oldTasks.map((task) =>
						task._id === taskId ? { ...task, ...updates } : task
					);
				});
			});
		};

		const handleTaskStatusChange = ({ taskId, newStatus }) => {
			handleSocketEvent("task_status", () => {
				queryClient.setQueryData(["tasks"], (oldTasks) => {
					if (!oldTasks) return oldTasks;
					return oldTasks.map((task) =>
						task._id === taskId
							? {
									...task,
									category:
										newStatus === "todo"
											? "To-Do"
											: newStatus === "inProgress"
											? "In Progress"
											: "Done",
							  }
							: task
					);
				});
			});
		};

		const handleTaskDelete = (taskId) => {
			handleSocketEvent("task_delete", () => {
				queryClient.setQueryData(["tasks"], (oldTasks) => {
					if (!oldTasks) return oldTasks;
					return oldTasks.filter((task) => task._id !== taskId);
				});
			});
		};

		const handleNewTask = (task) => {
			handleSocketEvent("new_task", () => {
				queryClient.setQueryData(["tasks"], (oldTasks) => {
					if (!oldTasks) return oldTasks;

					// Check if task already exists to prevent duplicates
					const taskExists = oldTasks.some((t) => t._id === task._id);
					if (taskExists) return oldTasks;

					// Transform category format
					const transformedTask = {
						...task,
						category:
							task.category === "todo"
								? "To-Do"
								: task.category === "inProgress"
								? "In Progress"
								: "Done",
					};

					return [...oldTasks, transformedTask];
				});
			});
		};

		socket.on("task_updated", handleTaskUpdate);
		socket.on("task_status_changed", handleTaskStatusChange);
		socket.on("task_deleted", handleTaskDelete);
		socket.on("new_task", handleNewTask);

		return () => {
			socket.off("task_updated", handleTaskUpdate);
			socket.off("task_status_changed", handleTaskStatusChange);
			socket.off("task_deleted", handleTaskDelete);
			socket.off("new_task", handleNewTask);
			setRetryCount(0);
		};
	}, [queryClient, retryCount]);

	const {
		data: tasks = [],
		isLoading: fetchLoading,
		refetch,
	} = useQuery({
		queryKey: ["tasks"],
		queryFn: async () => {
			try {
				const res = await axiosPublic.get("/tasks");
				return res.data.map((task) => ({
					...task,
					category:
						task.category === "todo"
							? "To-Do"
							: task.category === "inProgress"
							? "In Progress"
							: "Done",
				}));
			} catch (error) {
				console.error("Error fetching tasks:", error);
				throw error;
			}
		},
	});

	const createTaskMutation = useMutation({
		mutationFn: async (taskData) => {
			try {
				// Clean up the task data
				const { _id, ...cleanTaskData } = taskData;

				// Ensure category is in the correct format for the backend
				const apiData = {
					...cleanTaskData,
					category:
						cleanTaskData.category === "To-Do"
							? "todo"
							: cleanTaskData.category === "In Progress"
							? "inProgress"
							: "complete",
				};

				const response = await axiosPublic.post("/tasks", apiData);
				if (response.status !== 201) {
					throw new Error("Failed to create task");
				}
				return response.data;
			} catch (error) {
				console.error("Create task error:", error);
				throw new Error(
					error.response?.data?.message || "Failed to create task"
				);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["tasks"]);
			toast.success("Task created successfully!");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const deleteTaskMutation = useMutation({
		mutationFn: async (id) => {
			try {
				const response = await axiosPublic.delete(`/task-delete/${id}`);
				if (response.status !== 200 && response.status !== 204) {
					throw new Error("Failed to delete task");
				}
				return true;
			} catch (error) {
				console.error("Delete task error:", error);
				throw new Error(
					error.response?.data?.message || "Failed to delete task"
				);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["tasks"]);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const updateTaskMutation = useMutation({
		mutationFn: async ({ id, data }) => {
			try {
				const apiData = {
					...data,
					category:
						data.category === "To-Do"
							? "todo"
							: data.category === "In Progress"
							? "inProgress"
							: "complete",
				};

				const response = await axiosPublic.patch(`/task-update/${id}`, apiData);
				if (response.status !== 200) {
					throw new Error("Failed to update task");
				}
				return true;
			} catch (error) {
				console.error("Update task error:", error);
				throw new Error(
					error.response?.data?.message || "Failed to update task"
				);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["tasks"]);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const deleteTask = async (id) => {
		try {
			await deleteTaskMutation.mutateAsync(id);
			return true;
		} catch (error) {
			return false;
		}
	};

	const updateTask = async (id, data) => {
		try {
			await updateTaskMutation.mutateAsync({ id, data });
			return true;
		} catch (error) {
			return false;
		}
	};

	const createTask = async (data) => {
		try {
			await createTaskMutation.mutateAsync(data);
			return true;
		} catch (error) {
			return false;
		}
	};

	return {
		tasks,
		isLoading:
			fetchLoading ||
			createTaskMutation.isLoading ||
			deleteTaskMutation.isLoading ||
			updateTaskMutation.isLoading,
		createTask,
		deleteTask,
		updateTask,
		refetch,
	};
};
