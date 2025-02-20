import React from "react";
import { Outlet } from "react-router";

const MainLayOut = () => {
	return (
		<div className="">
			<Outlet></Outlet>
		</div>
	);
};

export default MainLayOut;
