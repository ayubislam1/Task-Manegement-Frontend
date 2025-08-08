import React, { useEffect, useState } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const TaskEdit = () => {
	const axiosPublic = useAxiosPublic();
	const { id } = useParams();
	const navigate = useNavigate();
	const [formData, setFormData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTask = async () => {
			try {
				const res = await axiosPublic.get(`/tasks/${id}`);
				setFormData(res.data[0]);
			} catch (err) {
				toast.error("Failed to load task for editing");
			} finally {
				setLoading(false);
			}
		};
		fetchTask();
	}, [axiosPublic, id]);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await axiosPublic.patch(`/tasks/${id}`, formData);
			toast.success("Task updated successfully!");
			navigate(`/dashboard/task-details/${id}`);
		} catch (err) {
			toast.error("Failed to update task");
		} finally {
			setLoading(false);
		}
	};

	if (loading || !formData) return <div className="p-8">Loading...</div>;

	return (
		<div className="max-w-xl mx-auto p-6 bg-white rounded-lg mt-10 shadow-lg">
			<h2 className="text-2xl font-semibold mb-4">Edit Task</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block mb-1">Title</label>
					<input
						className="w-full border rounded p-2"
						name="title"
						value={formData.title || ""}
						onChange={handleChange}
						required
					/>
				</div>
				<div>
					<label className="block mb-1">Description</label>
					<textarea
						className="w-full border rounded p-2"
						name="description"
						value={formData.description || ""}
						onChange={handleChange}
					/>
				</div>
				<div>
					<label className="block mb-1">Category</label>
					<select
						className="w-full border rounded p-2"
						name="category"
						value={formData.category || ""}
						onChange={handleChange}
					>
						<option value="To-Do">To-Do</option>
						<option value="In Progress">In Progress</option>
						<option value="Done">Done</option>
					</select>
				</div>
				<div>
					<label className="block mb-1">Priority</label>
					<select
						className="w-full border rounded p-2"
						name="priority"
						value={formData.priority || ""}
						onChange={handleChange}
					>
						<option value="Low">Low</option>
						<option value="Medium">Medium</option>
						<option value="High">High</option>
					</select>
				</div>
				<button
					type="submit"
					className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
					disabled={loading}
				>
					Save Changes
				</button>
			</form>
		</div>
	);
};

export default TaskEdit;
