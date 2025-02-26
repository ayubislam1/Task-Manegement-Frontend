import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const DashboardHome = () => {
    // Task Data
    const taskStatusData = [
        { name: "To Do", value: 10, color: "#2563eb" },
        { name: "In Progress", value: 7, color: "#fbbf24" },
        { name: "Done", value: 5, color: "#10b981" }
    ];

    const taskTrendData = [
        { date: "Mon", tasks: 4 },
        { date: "Tue", tasks: 6 },
        { date: "Wed", tasks: 8 },
        { date: "Thu", tasks: 5 },
        { date: "Fri", tasks: 9 },
        { date: "Sat", tasks: 7 },
        { date: "Sun", tasks: 3 }
    ];

    const priorityData = [
        { priority: "High", count: 12 },
        { priority: "Medium", count: 8 },
        { priority: "Low", count: 5 }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">22</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">5</div>
                        <p className="text-xs text-muted-foreground">+2 in progress</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">2 unavailable</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Sprint Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">78%</div>
                        <p className="text-xs text-muted-foreground">5 days remaining</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Status Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Task Distribution</CardTitle>
                        <CardDescription>Breakdown by task status</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={taskStatusData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {taskStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Task Trend Line Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Task Trend</CardTitle>
                        <CardDescription>Weekly task creation pattern</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={taskTrendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="tasks"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Priority Bar Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Task Priority</CardTitle>
                        <CardDescription>Distribution by priority level</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="priority" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="count"
                                    fill="#2563eb"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates from your team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div>
                            <p className="font-medium">Task completed</p>
                            <p className="text-sm text-muted-foreground">User onboarding flow</p>
                        </div>
                        <span className="text-sm text-muted-foreground">2h ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded">
                        <div>
                            <p className="font-medium">New task created</p>
                            <p className="text-sm text-muted-foreground">API integration</p>
                        </div>
                        <span className="text-sm text-muted-foreground">4h ago</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardHome;