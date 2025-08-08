import React, { useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Send, UserPlus } from "lucide-react";

const TeamInviteForm = ({ dashboardId }) => {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { inviteUser, loading } = useDashboard();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email.trim()) {
			toast.error("Please enter an email address");
			return;
		}

		if (!dashboardId) {
			toast.error("No dashboard selected");
			return;
		}

		setIsSubmitting(true);

		try {
			const success = await inviteUser(dashboardId, email.trim());
			if (success) {
				setEmail("");
				toast.success(`Invitation sent to ${email}`);
			}
		} catch (error) {
			console.error("Error inviting user:", error);
			toast.error("Failed to send invitation. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="p-4">
			<h3 className="text-lg font-medium mb-4 flex items-center">
				<UserPlus className="mr-2 h-5 w-5 text-indigo-500" />
				Invite Team Members
			</h3>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Label htmlFor="email">Email Address</Label>
					<div className="flex mt-1.5">
						<Input
							id="email"
							type="email"
							placeholder="colleague@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="rounded-r-none"
							disabled={isSubmitting || loading}
							required
						/>
						<Button
							type="submit"
							className="rounded-l-none bg-indigo-600 hover:bg-indigo-700"
							disabled={isSubmitting || loading || !email.trim()}
						>
							{isSubmitting || loading ? (
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
							) : (
								<>
									<Send className="h-4 w-4 mr-2" />
									Send
								</>
							)}
						</Button>
					</div>
				</div>

				<div className="text-sm text-gray-500 dark:text-gray-400">
					Your colleague will receive an email with a link to join this
					dashboard
				</div>
			</form>
		</div>
	);
};

export default TeamInviteForm;
