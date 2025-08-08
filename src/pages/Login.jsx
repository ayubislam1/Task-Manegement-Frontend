import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "react-toastify";

import useAxiosPublic from "../hooks/useAxiosPublic";

const Login = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || "/dashboard";
	const { SignIn, googleProvider, googleSignIn } = useAuth();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const axiosPublic = useAxiosPublic();

	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		const email = e.target.email.value;
		const pass = e.target.pass.value;

		SignIn(email, pass)
			.then((res) => {
				setLoading(false);
				navigate("/dashboard");
			})
			.catch(() => {
				setLoading(false);
				setError("Invalid email or password. Please try again.");
				console.log(error);
			});
	};

	const handleGoogleSignIn = async () => {
		try {
			const result = await googleSignIn();
			// Connect WebSocket after successful login
		
			toast.success("Successfully logged in!");
			navigate(from, { replace: true });
		} catch (error) {
			toast.error(error.message);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-gray-900">
						Welcome Back
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Sign in to access your task management dashboard
					</p>
				</div>

				<div className="mt-8 space-y-6">
					<Button
						onClick={handleGoogleSignIn}
						variant="outline"
						className="w-full flex items-center justify-center space-x-2 py-6 border-2 hover:bg-gray-50 transition-colors"
					>
						<FcGoogle className="w-6 h-6" />
						<span>Continue with Google</span>
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Login;
