import { useState } from "react";

import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import Swal from "sweetalert2";
import useAuth from "../hooks/useAuth";

export default function Register() {
	const { CreateUser, updateName, googleProvider } = useAuth();
	const [loading, setLoading] = useState(false);
	const [errormessage, setErrormessage] = useState("");
	const [errmessage, setErrmessage] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const navigate = useNavigate();
	const axiosPublic = useAxiosPublic();

	const image_host_key = import.meta.env.VITE_Image;
	const image_host_Api = `https://api.imgbb.com/1/upload?key=${image_host_key}`;

	const handleSubmit = async (e) => {
		e.preventDefault();

		const form = e.target;
		const name = form.name.value.trim();
		const photoUrl = form.photoUrl.files;
		const email = form.email.value.trim();
		const pass = form.pass.value.trim();
		const confirmPass = form.confirmPass.value.trim();
		const role = form.role.value.trim();

		setErrormessage("");

		if (pass !== confirmPass) {
			setErrormessage("Passwords do not match.");
			return;
		}

		const regex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#]{8,}$/;
		if (!regex.test(pass)) {
			setErrormessage(
				"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
			);
			return;
		}

		try {
			const formData = new FormData();
			formData.append("image", photoUrl[0]);

			const res = await axiosPublic.post(image_host_Api, formData);

			if (!res.data.success) {
				console.log("Image upload failed. Please try again.");
				return;
			}
			const imageUrl = res.data.data.display_url;
			const newUser = {
				name,
				photoUrl: imageUrl,
				email,
				status: "Active",
				role,
			};

			const userResult = await CreateUser(email, pass);
			console.log("Firebase user created:", userResult.user);

			await updateName(name, imageUrl);
			console.log("User profile updated successfully.");

			const response = await axiosPublic.post("/all-users", newUser);

			if (response.data.insertedId) {
				Swal.fire({
					position: "top-center",
					icon: "success",
					title: "Sign up success",
					showConfirmButton: false,
					timer: 1500,
				});

				navigate("/dashboard");
				form.reset();
			} else {
				console.log("Failed to save user to the database. Please try again.");
			}
		} catch (error) {
			console.error("An error occurred:", error.response || error.message);
		}
	};
	const handleClick = () => {
		setLoading(true);
		googleProvider().then((result) => {
			const userInfo = {
				email: result.user.email,
				name: result.user.displayName,
				status: "Active",
			};

			axiosPublic.post("/all-users", userInfo).then((res) => {
				console.log(res.data);
				navigate("/dashboard");
			});
		});
	};

	return (
		<Card className="max-w-7xl mx-auto my-5 flex flex-col lg:flex-row items-center border-none shadow-md">
			<div className="max-w-full w-full md:w-1/2 object-contain p-5 ">
				{/* <Lottie animationData={registerAnimation}></Lottie> */}
			</div>
			<div className="flex-1 p-5">
				<CardHeader>
					<CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-500">
						Create an account
					</CardTitle>
					<CardDescription className="text-sm md:text-base">
						Enter your information to create an account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="full-name">Full name</Label>
							<Input
								id="full-name"
								placeholder="John Doe"
								name="name"
								requiblue={true}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="Photo-url">Photo URL</Label>
							<Input
								id="Photo-url"
								type="File"
								placeholder="Photo URL"
								name="photoUrl"
								requiblue={true}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="me@example.com"
								name="email"
								requiblue={true}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<select
								id="role"
								name="role"
								className="block w-full border-gray-300 rounded-md"
								requiblue={true}
								required
							>
								<option value="">Select Role</option>
								<option value="Designer">Designer</option>
								<option value="Developer">Developer</option>
								<option value="Manager">Manager</option>
							</select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									placeholder="Password"
									type={showPassword ? "text" : "password"}
									name="pass"
									requiblue={true}
									required
								/>
								<span
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
								>
									{showPassword ? (
										<EyeOffIcon className="w-5 h-5 text-gray-600" />
									) : (
										<EyeIcon className="w-5 h-5 text-gray-600" />
									)}
								</span>
							</div>

							<p className="text-blue-500 text-xs md:text-sm">{errormessage}</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm Password</Label>
							<div className="relative">
								<Input
									id="confirm-password"
									type={showConfirmPassword ? "text" : "password"}
									name="confirmPass"
									requiblue={true}
									required
								/>
								<span
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
								>
									{showConfirmPassword ? (
										<EyeOffIcon className="w-5 h-5 text-gray-600" />
									) : (
										<EyeIcon className="w-5 h-5 text-gray-600" />
									)}
								</span>
							</div>
							<p className="text-blue-500 text-xs md:text-sm">{errmessage}</p>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox />
							<p className="text-xs md:text-sm">
								I agree to the{" "}
								<span className="underline">Terms & Conditions</span>
							</p>
						</div>
						<Button className="w-full dark:text-white bg-blue-500 hover:bg-blue-500">
							{loading ? "Loading.." : "Sign up"}
						</Button>
						<div className=" text-black">
							<Button
								className="w-full  bg-transparent text-white bg-blue-500 hover:bg-blue-500  dark:text-white dark:bg-primary hover:text-white border"
								onClick={handleClick}
							>
								Google
							</Button>
						</div>
						<p className="text-center text-sm md:text-base">
							Already have an account?
							<Link to="/login" className="underline font-semibold ">
								{" "}
								Sign in
							</Link>
						</p>
					</form>
				</CardContent>
			</div>
		</Card>
	);
}
