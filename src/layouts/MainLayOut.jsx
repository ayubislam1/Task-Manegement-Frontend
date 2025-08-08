import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Home from "../pages/Home";

const MainLayout = () => {
	const { user } = useAuth();
	const location = useLocation();

	if (
		user &&
		(location.pathname === "/login" || location.pathname === "/register")
	) {
		return <Navigate to="/dashboard" replace />;
	}

	return (
		<>
			{location.pathname === "/" ? (
				<Home />
			) : (
				<div className="min-h-screen bg-background">
					<Outlet />
				</div>
			)}
		</>
	);
};

export default MainLayout;
