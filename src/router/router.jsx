import React from "react";

import { createBrowserRouter } from "react-router";
import MainLayOut from "../layouts/MainLayOut";
import Login from "../pages/Login";

import Register from "../pages/Register";
import { Dashboard } from "../layouts/Dashboard";

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
		element: <Dashboard></Dashboard>,
		children: [{}],
	},
]);
export default router;
