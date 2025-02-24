import { useState } from "react";
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
import { Link, useLoaderData } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAxiosPublic from "../../hooks/useAxiosPublic"; // Import axiosPublic



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
	const users = useLoaderData();
	console.log(users);
	const { logOut, user } = useAuth();
	const userData = users.find((item) => item.email === user?.email);

	console.log(userData);
	const axiosPublic = useAxiosPublic();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [name, setName] = useState(userData?.name);
	const [email, setEmail] = useState(userData?.email);
	const [photo, setPhoto] = useState(userData?.photoURL);
	const [data, setData] = useState();

	const handleEvent = () => {
		logOut()
			.then(() => {
				console.log("Signout successful");
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const handleSave = async (id) => {
		const updatedUser = { name, email, photo };

		try {
			const response = await axiosPublic.patch(
				`/update-profile/${id}`,
				updatedUser
			);

			if (response.status === 200) {
				console.log("Profile updated successfully!");
				setIsModalOpen(false);

				// socket.on("profileUpdated", (updatedUser) => {
				// 	setData(updatedUser);
				// });
			} else {
				console.error("Failed to update profile");
			}
		} catch (error) {
			console.error("Error updating profile:", error);
		}
	};

	return (
		<>
			<Disclosure as="nav" className="dark:bg-gray-800 w-full top-0 right-0">
				{({ open }) => (
					<>
						<div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
							<div className="relative flex h-16 items-center justify-between">
								{/* Mobile menu button */}
								<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
									<DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 dark:text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
										{open ? (
											<XMarkIcon className="size-6" aria-hidden="true" />
										) : (
											<Bars3Icon className="size-6" aria-hidden="true" />
										)}
									</DisclosureButton>
								</div>

								{/* Desktop Search Input */}
								<div className="rounded-full hidden sm:inline-block w-2/3">
									<Input placeholder="  Search" />
								</div>
								<p>{userData?.name}</p>
								{/* Right section */}
								<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
									{/* Notifications */}
									<button
										type="button"
										className="relative rounded-full dark:bg-gray-800 p-1 text-gray-400 dark:hover:text-white hover:text-gray-700 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
									>
										<BellIcon aria-hidden="true" className="size-6" />
									</button>

									{/* Profile dropdown */}
									<Menu as="div" className="relative ml-3">
										<MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
											<Avatar>
												<AvatarImage src={user?.photoURL} alt="user" />
												<AvatarFallback className="bg-blue-600 text-white">
													CN
												</AvatarFallback>
											</Avatar>
										</MenuButton>
										<MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden">
											<MenuItem>
												<Link
													href="#"
													onClick={setIsModalOpen}
													className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
												>
													Your Profile
												</Link>
											</MenuItem>
											<MenuItem>
												<a
													href="#"
													className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
												>
													Settings
												</a>
											</MenuItem>
											<MenuItem>
												{user ? (
													<a
														href="#"
														onClick={handleEvent}
														className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
													>
														Sign out
													</a>
												) : (
													<Link
														to={"/login"}
														className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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

						{/* Mobile Navigation Menu */}
						<DisclosurePanel className="sm:hidden">
							<div className="px-2 pt-2 pb-3 space-y-1">
								{navigation.map((item) => (
									<a
										key={item.name}
										href={item.href}
										className={`block px-3 py-2 rounded-md text-base font-medium ${
											item.current
												? "bg-gray-900 text-white"
												: "text-gray-300 hover:bg-gray-700 hover:text-white"
										}`}
									>
										{item.name}
									</a>
								))}
							</div>
						</DisclosurePanel>
					</>
				)}
			</Disclosure>

			{/* Profile Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
						<form onSubmit={(e) => e.preventDefault()}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700">
									Name
								</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700">
									Email
								</label>
								<input
									type="email"
									value={user?.email}
									disabled
									className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700">
									Profile Picture
								</label>
								<input
									type="text"
									value={photo}
									onChange={(e) => setPhoto(e.target.value)}
									className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
							<div className="flex justify-end">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={() => handleSave(userData?._id)}
									className="px-4 py-2 bg-blue-600 text-white rounded-md"
								>
									Save
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
