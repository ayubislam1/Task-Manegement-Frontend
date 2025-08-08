import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { useAuth } from "../hooks/useAuth";
import {
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
import { motion } from "framer-motion";

const DashboardHome = () => {
	const { user } = useAuth();
	const axiosPublic = useAxiosPublic();
	const [stats, setStats] = useState({ users: 0, task: 0 });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true);
				const res = await axiosPublic.get("/task-stats");
				setStats(res.data);
			} catch (error) {
				// handle error
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, [axiosPublic]);

	const today = new Date();
	const formattedDate = today.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const [taskStats, setTaskStats] = useState({
		total: 0,
		todo: 0,
		inProgress: 0,
		completed: 0,
		overdue: 0,
	});

	const [chartData, setChartData] = useState([]);
	const [progressData, setProgressData] = useState([]);
	const [view, setView] = useState("today");

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
		setTaskStats(newStats);

		// Prepare chart data
		const data = [
			{ name: "To-Do", value: newStats.todo, color: "#ef4444" },
			{ name: "In Progress", value: newStats.inProgress, color: "#3b82f6" },
			{ name: "Completed", value: newStats.completed, color: "#10b981" },
		];
		setChartData(data);

		// Progress data (mock weekly data)
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

	// Mock upcoming deadlines
	const upcomingTasks = [
		{
			id: "SNC-544",
			title: "Sharing contacts via social media",
			dueDate: "Apr 21, 2025",
			priority: "High",
		},
		{
			id: "SNC-547",
			title: "Connect social media accounts",
			dueDate: "Apr 22, 2025",
			priority: "Medium",
		},
		{
			id: "SNC-550",
			title: "Add export user list feature",
			dueDate: "Apr 23, 2025",
			priority: "Low",
		},
		{
			id: "SNC-553",
			title: "Improve profile picture quality",
			dueDate: "Apr 24, 2025",
			priority: "Medium",
		},
	];

	// Mock recent activities
	const recentActivities = [
		{
			id: 1,
			user: "Alex Smith",
			action: "completed",
			task: "Update user interface",
			time: "2 hours ago",
		},
		{
			id: 2,
			user: "Emma Johnson",
			action: "commented on",
			task: "API integration",
			time: "3 hours ago",
		},
		{
			id: 3,
			user: "Michael Brown",
			action: "assigned",
			task: "Fix login bug",
			time: "5 hours ago",
		},
		{
			id: 4,
			user: "Sophie Williams",
			action: "created",
			task: "New analytics dashboard",
			time: "1 day ago",
		},
	];

	const renderCustomTooltip = ({ active, payload }) => {
		if (!active || !payload || !payload.length) return null;

		return (
			<div className="bg-gray-900 p-2 border border-gray-800 rounded-md">
				{payload.map((entry, index) => (
					<div key={index} className="flex items-center gap-2">
						<div
							className="w-3 h-3 rounded-sm"
							style={{ backgroundColor: entry.fill }}
						/>
						<span className="text-sm">
							{entry.name}: {entry.value}
						</span>
					</div>
				))}
			</div>
		);
	};

	return (
		<div className="bg-gray-950 text-white min-h-screen">
			<div className="p-6">
				<div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center justify-between text-white">
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
								{loading ? "-" : stats.users}
							</span>
							<span className="text-sm opacity-80">Users</span>
						</div>
						<div className="flex flex-col items-center">
							<span className="text-3xl font-bold">
								{loading ? "-" : stats.task}
							</span>
							<span className="text-sm opacity-80">Tasks</span>
						</div>
					</div>
				</div>
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-2xl font-bold">Dashboard Overview</h1>
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
						<button className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm">
							Generate Report
						</button>
					</div>
				</div>

				{/* Stats Cards */}
				<motion.div
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-400">Total Tasks</span>
							<ListTodo className="h-5 w-5 text-indigo-400" />
						</div>
						<div className="text-3xl font-bold">{taskStats.total}</div>
					</div>

					<div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-400">In Progress</span>
							<Clock className="h-5 w-5 text-blue-400" />
						</div>
						<div className="text-3xl font-bold">{taskStats.inProgress}</div>
					</div>

					<div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-400">Completed</span>
							<CheckSquare className="h-5 w-5 text-green-400" />
						</div>
						<div className="text-3xl font-bold">{taskStats.completed}</div>
					</div>

					<div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-400">Overdue</span>
							<AlertCircle className="h-5 w-5 text-red-400" />
						</div>
						<div className="text-3xl font-bold">{taskStats.overdue}</div>
					</div>
				</motion.div>

				<motion.div
					className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					{/* Task Progress Chart */}
					<div className="bg-gray-900 p-4 rounded-lg border border-gray-800 lg:col-span-2">
						<h2 className="text-lg font-semibold mb-4">Task Progress</h2>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={progressData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
									<XAxis dataKey="name" stroke="#9ca3af" />
									<YAxis stroke="#9ca3af" />
									<Tooltip content={renderCustomTooltip} />
									<Legend />
									<Bar dataKey="todo" stackId="a" fill="#ef4444" />
									<Bar dataKey="inProgress" stackId="a" fill="#3b82f6" />
									<Bar dataKey="completed" stackId="a" fill="#10b981" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Task Distribution */}
					<div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
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
									<Tooltip content={renderCustomTooltip} />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Upcoming Deadlines */}
					<div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
							<button className="text-gray-400 hover:text-white">
								<Calendar className="h-5 w-5" />
							</button>
						</div>
						<div className="space-y-3">
							{upcomingTasks.map((task) => (
								<div
									key={task.id}
									className="flex justify-between items-center p-3 bg-gray-800 rounded-md"
								>
									<div>
										<div className="flex items-center">
											<span className="text-indigo-400 mr-2">{task.id}</span>
											<span>{task.title}</span>
										</div>
										<div className="text-sm text-gray-400 mt-1">
											Due {task.dueDate}
										</div>
									</div>
									<span
										className={`px-2 py-1 rounded text-xs ${
											task.priority === "High"
												? "bg-red-900 bg-opacity-20 text-red-400"
												: task.priority === "Medium"
												? "bg-yellow-900 bg-opacity-20 text-yellow-400"
												: "bg-green-900 bg-opacity-20 text-green-400"
										}`}
									>
										{task.priority}
									</span>
								</div>
							))}
							<button className="text-indigo-400 hover:text-indigo-300 text-sm w-full text-center mt-2">
								View all tasks
							</button>
						</div>
					</div>

					{/* Recent Activity */}
					<div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold">Recent Activity</h2>
							<button className="text-gray-400 hover:text-white">
								<Filter className="h-5 w-5" />
							</button>
						</div>
						<div className="space-y-4">
							{recentActivities.map((activity) => (
								<div key={activity.id} className="flex items-start">
									<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
										{activity.user.charAt(0)}
									</div>
									<div>
										<p>
											<span className="font-medium">{activity.user}</span>{" "}
											<span className="text-gray-400">{activity.action}</span>{" "}
											<span className="text-indigo-400">{activity.task}</span>
										</p>
										<p className="text-sm text-gray-400">{activity.time}</p>
									</div>
								</div>
							))}
							<button className="text-indigo-400 hover:text-indigo-300 text-sm w-full text-center mt-2">
								View all activity
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardHome;
