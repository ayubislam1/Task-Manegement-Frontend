import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

const AcceptInvite = () => {
	const { token } = useParams();
	const { user, loading: authLoading } = useAuth();
	const { acceptInvitation, loading } = useDashboard();
	const [status, setStatus] = useState("loading"); // loading, accepted, error
	const navigate = useNavigate();

	useEffect(() => {
		const handleInvitation = async () => {
			if (!token || authLoading) return;

			// If not logged in, redirect to login with return URL
			if (!user) {
				// Store token in localStorage to retrieve after login
				localStorage.setItem("pendingInvitation", token);
				navigate(
					"/login?returnTo=" + encodeURIComponent(`/accept-invite/${token}`)
				);
				return;
			}

			try {
				setStatus("loading");

				const userInfo = {
					uid: user.uid,
					email: user.email,
					name: user.displayName || user.email,
					photoURL: user.photoURL,
				};

				const result = await acceptInvitation(token, userInfo);

				if (result) {
					setStatus("accepted");

					// Navigate to the dashboard after 2 seconds
					setTimeout(() => {
						navigate("/dashboard");
					}, 2000);
				} else {
					setStatus("error");
				}
			} catch (error) {
				console.error("Error accepting invitation:", error);
				toast.error("Failed to accept invitation");
				setStatus("error");
			}
		};

		handleInvitation();
	}, [token, user, authLoading]);

	if (authLoading || loading || status === "loading") {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div className="w-16 h-16 border-4 border-t-indigo-600 border-gray-200 rounded-full animate-spin mb-4"></div>
				<h2 className="text-xl font-semibold mb-2">Processing Invitation</h2>
				<p className="text-gray-600 dark:text-gray-400 text-center">
					Please wait while we verify your invitation...
				</p>
			</div>
		);
	}

	if (status === "accepted") {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-md w-full text-center">
					<div className="mx-auto bg-green-100 text-green-800 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-8 w-8"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<h2 className="text-2xl font-bold mb-2">Invitation Accepted!</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						You've successfully joined the team dashboard. Redirecting you to
						the dashboard...
					</p>
					<Button
						onClick={() => navigate("/dashboard")}
						className="bg-indigo-600 hover:bg-indigo-700 text-white"
					>
						Go to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	// Error state
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4">
			<div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-md w-full text-center">
				<div className="mx-auto bg-red-100 text-red-800 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</div>
				<h2 className="text-2xl font-bold mb-2">Invitation Error</h2>
				<p className="text-gray-600 dark:text-gray-400 mb-6">
					We couldn't process this invitation. It might be invalid, expired, or
					already used.
				</p>
				<Button
					onClick={() => navigate("/dashboard")}
					className="bg-indigo-600 hover:bg-indigo-700 text-white"
				>
					Go to Dashboard
				</Button>
			</div>
		</div>
	);
};

export default AcceptInvite;
