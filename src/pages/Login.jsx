import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import { Link, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import { EyeIcon, EyeOffIcon } from "lucide-react";



const Login = () => {
	const navigate = useNavigate();
	const { SignIn,googleProvider } = useAuth();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		const email = e.target.email.value;
		const pass = e.target.pass.value;

		SignIn(email, pass)
			.then((res) => {
				setLoading(false);
				navigate("/");
			})
			.catch(() => {
				setLoading(false);
				setError("Invalid email or password. Please try again.");
				console.log(error);
			});
	};
	const handleClick = () => {
		setLoading(true);
		googleProvider()
			.then(() => {
				navigate("/");
				setLoading(false);
			})
			.catch((error) => {
				setLoading(false);
				setError("Google Sign-In failed. Please try again.");
				console.log(error);
			});
	};

	return (
		<Card className="mx-auto max-w-2xl md:max-w-4xl lg:max-w-6xl my-5 flex flex-col-reverse md:flex-row justify-center items-center border-none gap-4 p-4">
			<div className="w-full md:w-1/2 space-y-6">
				<CardHeader className="space-y-2 text-center md:text-left">
					<CardTitle className="text-2xl md:text-4xl font-bold ">
						Sign in
					</CardTitle>
					<CardDescription>
						Enter your email and password to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								name="email"
								requiblue
								className="w-full"
							/>
						</div>
						<div className="space-y-2 relative">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									placeholder="password"
									type={showPassword ? "text" : "password"}
									name="pass"
									requiblue
									className="w-full"
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
						</div>
						<p className="text-blue-500">{error}</p>

						<p className="underline flex justify-end text-sm md:text-base">
							Forget password?
						</p>
						<Button
							type="submit"
							className="w-full dark:text-white bg-blue-500 hover:bg-blue-500"
						>
							{loading ? "Loading..." : "Sign in"}
						</Button>
                        <div className=" text-black">
							<Button
								className="w-full  bg-transparent text-white bg-blue-500 hover:bg-blue-500  dark:text-white dark:bg-primary hover:text-white border"
								onClick={handleClick}
							>
								Google
							</Button>
							
						</div>
						<p className="text-center">
							Don&apos;t have an account?{" "}
							<Link to="/register" className="underline font-semibold ">
								Sign up
							</Link>
						</p>
					</form>
				</CardContent>
			</div>

			<div className="w-full md:w-1/2 flex justify-center items-center">
				{/* <Lottie animationData={logInAnimation}></Lottie> */}
			</div>
		</Card>
	);
};

export default Login;
