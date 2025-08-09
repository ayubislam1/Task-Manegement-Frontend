import React, { useEffect, useState, useRef } from "react";
import {
	LayoutDashboard,
	ListTodo,
	Clock,
	CheckSquare,
	AlertCircle,
	Calendar,
	Filter,
	ChevronDown,
	Search,
	Plus,
	Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
} from "recharts";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { socket } from "../socket/socket";
import { useDashboard } from "../context/DashboardContext";
import { Button } from "@/components/ui/button";
import DashboardForm from "../components/DashboardForm";
import TeamInviteForm from "../components/TeamInviteForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import BoardCard from "../components/boards/BoardCard";

const API_BASE_URL = "http://localhost:5000";

const Dashboard = () => {
	const { user } = useAuth();
	const axiosPublic = useAxiosPublic();
	const [tasks, setTasks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState({
		total: 0,
		todo: 0,
		inProgress: 0,
		completed: 0,
		overdue: 0,
	});
	const [chartData, setChartData] = useState([]);
	const [progressData, setProgressData] = useState([]);
	const [view, setView] = useState("today");
	const [userStats, setUserStats] = useState({ users: 0, task: 0 });
	const [statsLoading, setStatsLoading] = useState(true);
	const [bannerColor, setBannerColor] = useState("#6366f1"); // default indigo-500
	const colorInputRef = useRef();
	const [showNewDashboardForm, setShowNewDashboardForm] = useState(false);

	// Dashboard Context
	const {
		dashboards,
		activeDashboard,
		dashboardTasks,
		members,
		loading: dashboardLoading,
		switchDashboard,
		createDashboard,
	} = useDashboard();
	console.log(dashboards);
	const navigate = useNavigate();

	useEffect(() => {
		if (user) {
			fetchTasks();
		}
	}, [user]);

	// Use dashboard tasks when available
	useEffect(() => {
		if (dashboardTasks && dashboardTasks.length > 0) {
			setTasks(dashboardTasks);
		}
	}, [dashboardTasks]);

	const fetchTasks = async () => {
		try {
			setIsLoading(true);
			const response = await axios.get(`${API_BASE_URL}/tasks`, {
				headers: { Authorization: `Bearer ${await user.getIdToken()}` },
			});
			setTasks(response.data);
		} catch (error) {
			console.error("Error fetching tasks:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setStatsLoading(true);
				const res = await axiosPublic.get("/task-stats");

				setUserStats(res.data);
			} catch (error) {
				// handle error
			} finally {
				setStatsLoading(false);
			}
		};
		fetchStats();
	}, [axiosPublic]);

	useEffect(() => {
		// Calculate task statistics
		const newStats = {
			total: tasks.length,
			todo: tasks?.filter((task) => task.category === "To-Do").length,
			inProgress: tasks?.filter((task) => task.category === "In Progress")
				.length,
			completed: tasks?.filter((task) => task.category === "Done").length,
			overdue: tasks?.filter((task) => {
				if (!task.dueDate) return false;
				return new Date(task.dueDate) < new Date() && task.category !== "Done";
			}).length,
		};
		setStats(newStats);

		// Prepare chart data
		const data = [
			{ name: "To-Do", value: newStats.todo, color: "#ef4444" },
			{ name: "In Progress", value: newStats.inProgress, color: "#3b82f6" },
			{ name: "Completed", value: newStats.completed, color: "#10b981" },
		];
		setChartData(data);

		// Generate weekly progress data
		const today = new Date();
		const dayOfWeek = today.getDay();
		const weekStart = new Date(today);
		weekStart.setDate(today.getDate() - dayOfWeek);

		const weeklyData = [];
		const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

		for (let i = 0; i < 7; i++) {
			const date = new Date(weekStart);
			date.setDate(weekStart.getDate() + i);

			const dayTasks = tasks.filter((task) => {
				const taskDate = new Date(task.createdAt);
				return taskDate.toDateString() === date.toDateString();
			});

			weeklyData.push({
				name: dayNames[i],
				completed: (taskDate) =>
					new Date(taskDate.completedAt).toDateString() === date.toDateString(),
				inProgress: (taskDate) =>
					taskDate.category === "In Progress" &&
					new Date(taskDate.updatedAt).toDateString() === date.toDateString(),
				todo: (taskDate) =>
					taskDate.category === "To-Do" &&
					new Date(taskDate.createdAt).toDateString() === date.toDateString(),
			});
		}

		// Mock weekly data for demonstration
		const progress = [
			{ name: "Mon", completed: 5, inProgress: 8, todo: 12 },
			{ name: "Tue", completed: 7, inProgress: 10, todo: 10 },
			{ name: "Wed", completed: 10, inProgress: 8, todo: 8 },
			{ name: "Thu", completed: 12, inProgress: 9, todo: 6 },
			{ name: "Fri", completed: 15, inProgress: 7, todo: 5 },
			{ name: "Sat", completed: 16, inProgress: 6, todo: 4 },
			{ name: "Sun", completed: 18, inProgress: 5, todo: 3 },
		];
		setProgressData(progress);
	}, [tasks]);

	// Get upcoming tasks with due dates
	const upcomingTasks = tasks
		.filter(
			(task) =>
				task.dueDate &&
				new Date(task.dueDate) >= new Date() &&
				task.category !== "Done"
		)
		.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
		.slice(0, 4);

	// Recent activities (mock data for now)
	const recentActivities = [
		{
			id: 1,
			user: user?.displayName || "You",
			action: "completed",
			task: "Update user interface",
			time: "2 hours ago",
		},
		{
			id: 2,
			user: user?.displayName || "You",
			action: "created",
			task: "API integration",
			time: "3 hours ago",
		},
		{
			id: 3,
			user: user?.displayName || "You",
			action: "updated",
			task: "Fix login bug",
			time: "5 hours ago",
		},
		{
			id: 4,
			user: user?.displayName || "You",
			action: "moved",
			task: "New analytics dashboard",
			time: "1 day ago",
		},
	];

	const today = new Date();
	const formattedDate = today.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	if (isLoading || dashboardLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
			</div>
		);
	}

	// Helper to handle dashboard selection and navigation
	const handleDashboardSelect = (dashboard) => {
		switchDashboard(dashboard);
		navigate(`/dashboard/taskboard/${dashboard._id}`);
	};

	return (
		<div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
			<div className="p-6">
				{/* Professional Welcome Banner with user-changeable color */}
				<div
					className="rounded-2xl shadow-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between text-white relative"
					style={{
						background: `linear-gradient(90deg, ${bannerColor}, #a78bfa, #ec4899)`,
					}}
				>
					<div>
						<h1 className="text-2xl md:text-3xl font-bold mb-2">
							Welcome back{user?.displayName ? `, ${user.displayName}` : "!"}
						</h1>
						<p className="text-lg md:text-xl font-medium opacity-90">
							{formattedDate}
						</p>
					</div>
					<div className="flex gap-8 mt-4 md:mt-0">
						<div className="flex flex-col items-center">
							<span className="text-3xl font-bold">
								{statsLoading ? "-" : userStats.users}
							</span>
							<span className="text-sm opacity-80">Users</span>
						</div>
						<div className="flex flex-col items-center">
							<span className="text-3xl font-bold">
								{statsLoading ? "-" : userStats.task}
							</span>
							<span className="text-sm opacity-80">Tasks</span>
						</div>
					</div>
					{/* Color Picker Button */}
					<button
						className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full p-2 transition-colors"
						onClick={() => colorInputRef.current.click()}
						title="Change banner color"
					>
						<svg width="20" height="20" fill="none" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm0-14a6 6 0 0 0-6 6c0 2.21 2.69 5.13 5.1 7.36.53.5 1.27.5 1.8 0C15.31 15.13 18 12.21 18 10a6 6 0 0 0-6-6Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
							/>
						</svg>
						<input
							type="color"
							ref={colorInputRef}
							value={bannerColor}
							onChange={(e) => setBannerColor(e.target.value)}
							className="hidden"
						/>
					</button>
				</div>

				{/* Team Dashboards Section */}
				<div className="mb-8">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-bold flex items-center">
							<Users className="mr-2 h-5 w-5" />
							Team Dashboards
						</h2>

						<Dialog>
							<DialogTrigger asChild>
								<Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
									<Plus size={16} className="mr-2" />
									New Dashboard
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
								<DashboardForm
									onSuccess={() => console.log("Dashboard created")}
								/>
							</DialogContent>
						</Dialog>
					</div>

					{dashboards.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
							{dashboards.map((dashboard) => (
								<BoardCard
									key={dashboard._id}
									dashboard={dashboard}
									isActive={activeDashboard?._id === dashboard._id}
									onSelect={handleDashboardSelect}
								/>
							))}
						</div>
					) : (
						<div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 mb-6">
							<h3 className="text-lg font-medium mb-2">No Dashboards Yet</h3>
							<p className="text-gray-500 dark:text-gray-400 mb-4">
								Create your first dashboard to start collaborating with your
								team
							</p>
							<Dialog>
								<DialogTrigger asChild>
									<Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
										<Plus size={16} className="mr-2" />
										Create Dashboard
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
									<DashboardForm
										onSuccess={() => console.log("Dashboard created")}
									/>
								</DialogContent>
							</Dialog>
						</div>
					)}
				</div>

				{/* Dashboard Overview Header */}
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-2xl font-bold">
						{activeDashboard
							? `${activeDashboard.name} Overview`
							: "Dashboard Overview"}
					</h1>
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<span className="text-gray-400">View</span>
							<div className="flex items-center text-gray-400">
								<span>
									{view === "today"
										? "Today"
										: view === "week"
										? "This Week"
										: "This Month"}
								</span>
								<ChevronDown size={16} className="ml-1" />
							</div>
						</div>
						<Link
							to="/dashboard/tasks"
							className="bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-md text-sm flex items-center text-white"
						>
							<ListTodo size={16} className="mr-2" />
							View Task Board
						</Link>
						<Link
							to="/dashboard/tasks"
							className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm flex items-center text-white"
						>
							<Plus size={16} className="mr-2" />
							New Task
						</Link>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow p-4">
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-500">Total Tasks</span>
							<ListTodo className="h-5 w-5 text-indigo-500" />
						</div>
						<div className="text-3xl font-bold text-gray-900">
							{stats.total}
						</div>
					</div>

					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow p-4">
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-500">To-Do</span>
							<ListTodo className="h-5 w-5 text-red-500" />
						</div>
						<div className="text-3xl font-bold text-gray-900">{stats.todo}</div>
					</div>

					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow p-4">
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-500">In Progress</span>
							<Clock className="h-5 w-5 text-blue-500" />
						</div>
						<div className="text-3xl font-bold text-gray-900">
							{stats.inProgress}
						</div>
					</div>

					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow p-4">
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-500">Completed</span>
							<CheckSquare className="h-5 w-5 text-green-500" />
						</div>
						<div className="text-3xl font-bold text-gray-900">
							{stats.completed}
						</div>
					</div>

					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow p-4">
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-500">Overdue</span>
							<AlertCircle className="h-5 w-5 text-red-500" />
						</div>
						<div className="text-3xl font-bold text-gray-900">
							{stats.overdue}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
					{/* Task Progress Chart */}
					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow p-4 lg:col-span-2">
						<h2 className="text-lg font-semibold mb-4">Task Progress</h2>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={progressData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
									<XAxis dataKey="name" stroke="#6b7280" />
									<YAxis stroke="#6b7280" />
									<Tooltip
										contentStyle={{
											backgroundColor: "#f9fafb",
											border: "1px solid #e5e7eb",
											borderRadius: "4px",
										}}
									/>
									<Legend />
									<Bar dataKey="todo" stackId="a" fill="#ef4444" />
									<Bar dataKey="inProgress" stackId="a" fill="#3b82f6" />
									<Bar dataKey="completed" stackId="a" fill="#10b981" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Task Distribution */}
					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow p-4">
						<h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
						<div className="h-64 flex items-center justify-center">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={chartData}
										cx="50%"
										cy="50%"
										labelLine={false}
										outerRadius={80}
										fill="#8884d8"
										dataKey="value"
									>
										{chartData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											backgroundColor: "#f9fafb",
											border: "1px solid #e5e7eb",
											borderRadius: "4px",
										}}
									/>
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Upcoming Deadlines */}
					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow p-4">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
							<button className="text-gray-500 hover:text-gray-700">
								<Calendar className="h-5 w-5" />
							</button>
						</div>
						<div className="space-y-3">
							{upcomingTasks.length > 0 ? (
								upcomingTasks.map((task) => (
									<div
										key={task._id}
										className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
									>
										<div>
											<div className="flex items-center">
												<span className="text-indigo-500 mr-2">
													{task.category === "To-Do" ? (
														<ListTodo size={16} />
													) : task.category === "In Progress" ? (
														<Clock size={16} />
													) : (
														<CheckSquare size={16} />
													)}
												</span>
												<span>{task.title}</span>
											</div>
											<div className="text-sm text-gray-500 mt-1">
												Due {new Date(task.dueDate).toLocaleDateString()}
											</div>
										</div>
										<span
											className={`px-2 py-1 rounded text-xs ${
												new Date(task.dueDate) <
												new Date(new Date().setDate(new Date().getDate() + 1))
													? "bg-red-100 text-red-500"
													: new Date(task.dueDate) <
													  new Date(
															new Date().setDate(new Date().getDate() + 3)
													  )
													? "bg-yellow-100 text-yellow-500"
													: "bg-green-100 text-green-500"
											}`}
										>
											{new Date(task.dueDate) <
											new Date(new Date().setDate(new Date().getDate() + 1))
												? "Today"
												: new Date(task.dueDate) <
												  new Date(new Date().setDate(new Date().getDate() + 3))
												? "Soon"
												: "Upcoming"}
										</span>
									</div>
								))
							) : (
								<div className="text-gray-500 text-center py-4">
									No upcoming deadlines
								</div>
							)}
							<Link
								to="/dashboard/tasks"
								className="text-indigo-500 hover:text-indigo-400 text-sm flex justify-center mt-2"
							>
								View all tasks
							</Link>
						</div>
					</div>

					{/* Recent Activity */}
					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow p-4">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold">Recent Activity</h2>
							<button className="text-gray-500 hover:text-gray-700">
								<Filter className="h-5 w-5" />
							</button>
						</div>
						<div className="space-y-4">
							{recentActivities.map((activity) => (
								<div key={activity.id} className="flex items-start">
									<div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center mr-3 flex-shrink-0">
										{activity.user.charAt(0)}
									</div>
									<div>
										<p>
											<span className="font-medium">{activity.user}</span>{" "}
											<span className="text-gray-500">{activity.action}</span>{" "}
											<span className="text-indigo-500">{activity.task}</span>
										</p>
										<p className="text-sm text-gray-500">{activity.time}</p>
									</div>
								</div>
							))}
							<button className="text-indigo-500 hover:text-indigo-400 text-sm w-full text-center mt-2">
								View all activity
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
