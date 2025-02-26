import {
	Home,
	ClipboardCheck,
	ClipboardList,
	Users,
	List,
	CircleCheckBig,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Navbar from "../components/ui/Navbar";
import { Link, Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import DashboardHome from "../pages/DashboardHome";

const items = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: Home,
	},
	{
		title: "Task",
		url: "/dashboard/task",
		icon: List,
	},
	{
		title: "Complete",
		url: "/dashboard/done",
		icon: CircleCheckBig,
	},
	{
		title: "In progress",
		url: "/dashboard/in-progress",
		icon: ClipboardList,
	},
	{
		title: "To Do",
		url: "/dashboard/todo",
		icon: ClipboardCheck,
	},
	{
		title: "Team",
		url: "/dashboard/team",
		icon: Users,
	},
];

export function Dashboard() {
	return (
		<div className="flex w-full min-h-screen">
			<div>
				<Sidebar>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel className="text-xl text-blue-500">
								Task-Me
							</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu className="mt-10">
									{items.map((item) => (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild>
												<Link to={item.url}>
													<item.icon />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
				</Sidebar>
			</div>
			<div className="flex-1 ">
				<Navbar></Navbar>

				<div className=" bg-gray-50 border rounded-tl-lg  p-5  min-h-screen">
					<Outlet />
				</div>
			</div>
			<ToastContainer></ToastContainer>
		</div>
	);
}
