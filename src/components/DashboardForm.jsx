import { useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../hooks/useAuth";

const DashboardForm = ({ onSuccess }) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const { createDashboard, loading } = useDashboard();
	const { user } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error("Dashboard name is required");
			return;
		}

		const dashboardData = {
			name: name.trim(),
			description: description.trim(),
		};

		const success = await createDashboard(dashboardData);
		if (success && onSuccess) {
			setName("");
			setDescription("");
			onSuccess();
		}
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md mx-auto">
			<h2 className="text-xl font-semibold mb-4">Create New Dashboard</h2>
			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">
						Dashboard Name
					</label>
					<Input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="My Team Dashboard"
						disabled={loading}
						required
					/>
				</div>

				<div className="mb-6">
					<label className="block text-sm font-medium mb-1">
						Description (Optional)
					</label>
					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="What is this dashboard for?"
						disabled={loading}
						rows={3}
					/>
				</div>

				<div className="flex justify-end">
					<Button
						type="submit"
						disabled={loading || !name.trim()}
						className="bg-indigo-600 hover:bg-indigo-700 text-white"
					>
						{loading ? "Creating..." : "Create Dashboard"}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default DashboardForm;
