import {  Home, ClipboardCheck, ClipboardList, Settings,List,CircleCheckBig } from "lucide-react";

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
import { Outlet } from "react-router";

// Menu items.
const items = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: Home,
	},
	{
		title: "Task",
		url: "/task",
		icon: List,
	},
	{
		title: "Complete",
		url: "/done",
		icon: CircleCheckBig,
	},
	{
		title: "In progress",
		url: "/in-progress",
		icon: ClipboardList,
	},
	{
		title: "To Do",
		url: "/todo",
		icon:ClipboardCheck,
	},
];

export function Dashboard() {
	return (
		<div className="flex w-full min-h-screen">
			<div >
				<Sidebar >
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel >Application</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu className="mt-10">
									{items.map((item) => (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild>
												<a href={item.url}>
													<item.icon />
													<span>{item.title}</span>
												</a>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
				</Sidebar>
			</div>
			<div className="flex-1">
				<Navbar></Navbar>
				<div className="border rounded-tl-lg min-h-screen">
					<Outlet/>
				</div>
			</div>
		</div>
	);
}
