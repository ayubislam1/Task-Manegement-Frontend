import React from "react";

import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayOut";
import ErrorPage from "../pages/ErrorPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import TaskDetails from "../pages/TaskDetails";
import Todo from "../pages/Todo";
import InProgress from "../pages/InProgress";
import Complete from "../pages/Complete";
import Team from "../pages/Team";
import TaskEdit from "../pages/TaskEdit";
import PrivateRoute from "./PrivateRoute";
import AppLayout from "../layouts/AppLayOut";
import Dashboard from "../pages/DashBoard";
import TaskBoard from "../pages/TaskBoard";
import AcceptInvite from "../pages/AcceptInvite";

const router = createBrowserRouter([
	{
		path: "/",
		element: <MainLayout />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "/login",
				element: <Login />,
			},
			{
				path: "/register",
				element: <Register />,
			},
		],
	},
	{
		path: "/accept-invite/:token",
		element: (
			<PrivateRoute>
				<AcceptInvite />
			</PrivateRoute>
		),
	},
	{
		path: "/dashboard",
		element: (
			<PrivateRoute>
				<AppLayout />
			</PrivateRoute>
		),
		children: [
			{
				path: "",
				element: <Dashboard></Dashboard>,
			},
			{
				path: "tasks",
				element: <TaskBoard></TaskBoard>,
			},
			{
				path: "task-details/:id",
				element: <TaskDetails></TaskDetails>,
			},
			{
				path: "task-edit/:id",
				element: <TaskEdit></TaskEdit>,
			},
			{
				path: "taskboard/:id",
				element: <TaskBoard></TaskBoard>,
			},
			{
				path: "to-do",
				element: <Todo></Todo>,
			},
			{
				path: "in-progress",
				element: <InProgress></InProgress>,
			},
			{
				path: "complete",
				element: <Complete></Complete>,
			},
			{
				path: "team",
				element: <Team></Team>,
			},
		],
	},
]);

export default router;
