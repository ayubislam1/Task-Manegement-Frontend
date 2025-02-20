import React from "react";

import { createBrowserRouter } from "react-router";
import MainLayOut from "../layouts/MainLayOut";
import Login from "../pages/Login";

import Register from "../pages/Register";
import { Dashboard } from "../layouts/Dashboard";
import Team from "../pages/Team";
import { SidebarProvider } from "../components/ui/sidebar";
import Task from "../pages/Task";

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
		element: <SidebarProvider><Dashboard></Dashboard></SidebarProvider>,
		children: [
            {
                path:"/dashboard/task",
                element:<Task></Task>
            },
			{
				path: "/dashboard/team",
				element: <Team></Team>,
			},
		],
	},
]);
export default router;
