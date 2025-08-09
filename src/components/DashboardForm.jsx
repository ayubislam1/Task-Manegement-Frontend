import { useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../hooks/useAuth";
import {
	Plus,
	LayoutDashboard,
	Users,
	Target,
	Sparkles,
	Check,
	ChevronRight,
	Zap,
	X,
} from "lucide-react";

const DashboardForm = ({ onSuccess, onCancel }) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [selectedTemplate, setSelectedTemplate] = useState("blank");
	const { createDashboard, loading } = useDashboard();
	const { user } = useAuth();

	const dashboardTemplates = [
		{
			id: "blank",
			name: "Blank Dashboard",
			description: "Start with a clean slate",
			icon: <LayoutDashboard className="w-6 h-6" />,
			color: "bg-gradient-to-br from-slate-400 to-slate-600",
		},
		{
			id: "team",
			name: "Team Project",
			description: "Perfect for team collaboration",
			icon: <Users className="w-6 h-6" />,
			color: "bg-gradient-to-br from-blue-400 to-blue-600",
		},
		{
			id: "personal",
			name: "Personal Tasks",
			description: "Organize your personal workflow",
			icon: <Target className="w-6 h-6" />,
			color: "bg-gradient-to-br from-purple-400 to-purple-600",
		},
	];

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error("Dashboard name is required");
			return;
		}

		const dashboardData = {
			name: name.trim(),
			description: description.trim(),
			template: selectedTemplate,
		};

		const success = await createDashboard(dashboardData);
		if (success && onSuccess) {
			setName("");
			setDescription("");
			setSelectedTemplate("blank");
			onSuccess();
		}
	};

	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-4xl mx-auto border border-gray-200 dark:border-gray-700 relative">
			{/* Close Button */}
			{onCancel && (
				<button
					onClick={onCancel}
					className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
				>
					<X className="w-5 h-5" />
				</button>
			)}

			{/* Header */}
			<div className="text-center mb-6 md:mb-8">
				<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
					<Sparkles className="w-8 h-8 text-white" />
				</div>
				<h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Create New Dashboard
				</h2>
				<p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
					Set up your workspace to organize tasks and collaborate with your team
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
				{/* Dashboard Templates */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
						Choose a Template
					</label>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
						{dashboardTemplates.map((template) => (
							<div
								key={template.id}
								onClick={() => setSelectedTemplate(template.id)}
								className={`relative p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
									selectedTemplate === template.id
										? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
										: "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
								}`}
							>
								{selectedTemplate === template.id && (
									<div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
										<Check className="w-4 h-4 text-white" />
									</div>
								)}
								<div
									className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${template.color} flex items-center justify-center mb-3`}
								>
									<div className="w-5 h-5 md:w-6 md:h-6 text-white">
										{template.icon}
									</div>
								</div>
								<h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
									{template.name}
								</h3>
								<p className="text-xs text-gray-600 dark:text-gray-400">
									{template.description}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Dashboard Name */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
						Dashboard Name
					</label>
					<div className="relative">
						<Input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Marketing Team Q1 Projects"
							disabled={loading}
							required
							className="pl-12 h-11 md:h-12 text-sm md:text-base border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						/>
						<LayoutDashboard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
					</div>
				</div>

				{/* Description */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
						Description{" "}
						<span className="text-gray-400 font-normal">(Optional)</span>
					</label>
					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe the purpose of this dashboard and what your team will accomplish..."
						disabled={loading}
						rows={3}
						className="text-sm md:text-base border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
					/>
				</div>

				{/* Features Preview */}
				<div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 md:p-6 border border-indigo-200 dark:border-indigo-800">
					<h3 className="font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center text-sm md:text-base">
						<Zap className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 mr-2" />
						What you'll get:
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
						<div className="flex items-center text-gray-700 dark:text-gray-300">
							<Check className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-2 flex-shrink-0" />
							Kanban task boards
						</div>
						<div className="flex items-center text-gray-700 dark:text-gray-300">
							<Check className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-2 flex-shrink-0" />
							Team collaboration
						</div>
						<div className="flex items-center text-gray-700 dark:text-gray-300">
							<Check className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-2 flex-shrink-0" />
							Real-time updates
						</div>
						<div className="flex items-center text-gray-700 dark:text-gray-300">
							<Check className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-2 flex-shrink-0" />
							Progress tracking
						</div>
					</div>
				</div>

				{/* Submit Button */}
				<div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
					{onCancel && (
						<Button
							type="button"
							onClick={onCancel}
							variant="outline"
							disabled={loading}
							className="px-6 md:px-8 py-2.5 md:py-3 h-auto text-sm md:text-base font-semibold rounded-xl transition-all duration-200"
						>
							Cancel
						</Button>
					)}
					<Button
						type="submit"
						disabled={loading || !name.trim()}
						className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 md:px-8 py-2.5 md:py-3 h-auto text-sm md:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
					>
						{loading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent mr-2"></div>
								Creating Dashboard...
							</>
						) : (
							<>
								<Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
								Create Dashboard
								<ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default DashboardForm;
