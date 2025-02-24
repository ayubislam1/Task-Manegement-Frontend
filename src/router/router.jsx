import React from "react";

import { createBrowserRouter } from "react-router";
import MainLayOut from "../layouts/MainLayOut";
import Login from "../pages/Login";

import Register from "../pages/Register";
import { Dashboard } from "../layouts/Dashboard";
import Team from "../pages/Team";
import { SidebarProvider } from "../components/ui/sidebar";
import Task from "../pages/Task";
import Navbar from "../components/ui/Navbar";
import Modal from "../components/ui/Modal";
import TaskDetails from "../pages/TaskDetails";

const router = createBrowserRouter([
	{
		path: "/",
		element: <MainLayOut></MainLayOut>,
		errorElement: <h1>error</h1>,
		children: [
			{
				path: "/login",
				element: <Login></Login>,
			},
			{
				path: "/register",
				element: <Register></Register>,
			},
		],
	},
	{
		path: "/dashboard",
		element: (
			<SidebarProvider>
				<Dashboard></Dashboard>
			</SidebarProvider>
		),
		loader: async () => await fetch(`http://localhost:3000/all-users`),

		children: [
			{
				path: "/dashboard/task",
				element: <Task></Task>,
			},
			{
				path: "/dashboard/task-details/:id",
				element: <TaskDetails></TaskDetails>,
			},
			{
				path: "/dashboard/team",
				element: <Team></Team>,
			},
		],
	},
]);
export default router;
