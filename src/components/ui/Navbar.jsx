import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import useAuth from "../../hooks/useAuth";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const navigation = [
	{ name: "Dashboard", href: "/dashboard", current: true },
	{ name: "Task", href: "/dashboard/task", current: false },
	{ name: "Complete", href: "/dashboard/done", current: false },
	{ name: "In progress", href: "/dashboard/in-progress", current: false },
	{ name: "To Do", href: "/dashboard/todo", current: false },
	{ name: "Team", href: "/dashboard/team", current: false },
];

function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
	const { logOut, user } = useAuth();

	const handleEvent = () => {
		logOut()
			.then(() => {
				console.log("signout");
			})
			.catch((error) => {
				console.log(error);
			});
	};
	return (
		<Disclosure as="nav" className="darK:bg-gray-800 w-full top-0 right-0 ">
			<div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
				<div className="relative flex h-16 items-center justify-between">
					<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
						{/* Mobile menu button*/}
						<DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 dark:text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
							<span className="absolute -inset-0.5" />
							<span className="sr-only">Open main menu</span>
							<Bars3Icon
								aria-hidden="true"
								className="block size-6 group-data-open:hidden"
							/>
							<XMarkIcon
								aria-hidden="true"
								className="hidden size-6 group-data-open:block"
							/>
						</DisclosureButton>
					</div>

					<div className=" rounded-full hidden sm:inline-block w-2/3">
						{" "}
						<Input className="" placeholder="  Search"></Input>
					</div>
					<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
						<button
							type="button"
							className="relative rounded-full dark:bg-gray-800  p-1 text-gray-400 dark:hover:text-white hover:text-gray-700 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
						>
							<span className="absolute -inset-1.5" />
							<span className="sr-only">View notifications</span>
							<BellIcon aria-hidden="true" className="size-6" />
						</button>

						{/* Profile dropdown */}
						<Menu as="div" className="relative ml-3">
							<div>
								<MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
									<span className="absolute -inset-1.5" />
									<span className="sr-only">Open user menu</span>
									<Avatar>
										<AvatarImage
											src={user?.photoURL}
											alt="user"
										/>
										<AvatarFallback className="bg-blue-600 text-white">CN</AvatarFallback>
									</Avatar>
								</MenuButton>
							</div>
							<MenuItems
								transition
								className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
							>
								<MenuItem>
									<a
										href="#"
										className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
									>
										Your Profile
									</a>
								</MenuItem>
								<MenuItem>
									<a
										href="#"
										className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
									>
										Settings
									</a>
								</MenuItem>
								<MenuItem>
									{user ? (
										<a
											href="#"
											onClick={handleEvent}
											className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
										>
											Sign out
										</a>
									) : (
										<Link
											to={"/login"}
											className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
										>
											Sign in
										</Link>
									)}
								</MenuItem>
							</MenuItems>
						</Menu>
					</div>
				</div>
			</div>

			<DisclosurePanel className="sm:hidden">
				<div className="space-y-1 px-2 pt-2 pb-3">
					{navigation.map((item) => (
						<DisclosureButton
							key={item.name}
							as="a"
							href={item.href}
							aria-current={item.current ? "page" : undefined}
							className={classNames(
								item.current
									? "bg-gray-900 text-white"
									: "text-gray-300 hover:bg-gray-700 hover:text-white",
								"block rounded-md px-3 py-2 text-base font-medium"
							)}
						>
							{item.name}
						</DisclosureButton>
					))}
				</div>
			</DisclosurePanel>
		</Disclosure>
	);
}
