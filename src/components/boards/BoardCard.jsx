import React, { useState, useRef } from "react";
import { Users, MoreVertical, Trash2 } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import ReactDOM from "react-dom";

const BoardCard = ({ dashboard, isActive, onSelect }) => {
	const { user } = useAuth();
	const { deleteDashboard } = useDashboard();
	const [showDropdown, setShowDropdown] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const menuBtnRef = useRef(null);
	const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

	const handleDropdownClick = (e) => {
		e.stopPropagation();
		console.log("🔍 Dropdown clicked!");
		if (!showDropdown && menuBtnRef.current) {
			const rect = menuBtnRef.current.getBoundingClientRect();
			setDropdownPos({
				top: rect.bottom + window.scrollY,
				left: rect.right + window.scrollX - 192, // 192px = w-48
			});
		}
		setShowDropdown(!showDropdown);
	};

	const handleDeleteClick = (e) => {
		e.stopPropagation();
		e.preventDefault();
		console.log("🗑️ Delete clicked!");
		setShowDeleteModal(true);
		setShowDropdown(false);
	};

	const handleConfirmDelete = async () => {
		console.log("🔥 DELETE CONFIRMED!");

		if (!dashboard?._id) {
			toast.error("Dashboard ID not found");
			return;
		}

		setLoading(true);
		try {
			console.log("🚀 Calling deleteDashboard with ID:", dashboard._id);
			await deleteDashboard(dashboard._id);
			toast.success("Dashboard deleted successfully");
			setShowDeleteModal(false);
		} catch (error) {
			console.error("Delete error:", error);
			toast.error("Failed to delete dashboard");
		} finally {
			setLoading(false);
		}
	};

	const handleCancelDelete = () => {
		console.log("❌ Delete cancelled!");
		setShowDeleteModal(false);
	};

	return (
		<>
			<div
				className={`group relative bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-xl shadow-lg border cursor-pointer transition-all duration-300 ${
					showDeleteModal
						? "opacity-75"
						: showDropdown
						? "opacity-90"
						: "hover:shadow-2xl hover:scale-105 hover:-translate-y-2"
				} ${
					isActive
						? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 shadow-blue-200/50"
						: "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
				}`}
				onClick={() => {
					if (!showDeleteModal && !showDropdown) {
						onSelect(dashboard);
					}
				}}
			>
				{/* Active corner indicator */}
				{isActive && (
					<div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full animate-pulse ring-2 ring-green-200"></div>
				)}

				{/* Card content */}
				<div className="p-6">
					{/* Header with title and 3-dot menu */}
					<div className="flex items-start justify-between mb-4">
						<div className="flex-1 pr-3 ">
							{/* Dashboard Title - More Prominent */}
							<div className="mb-3">
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 leading-tight tracking-tight">
									{dashboard.title || dashboard.name}
								</h3>
							</div>
						</div>

						{/* Enhanced 3-dot menu */}
						<div className="relative flex-shrink-0 z-10">
							<button
								ref={menuBtnRef}
								onClick={handleDropdownClick}
								className={`p-2 rounded-full transition-all duration-200 backdrop-blur-sm ${
									showDeleteModal
										? "opacity-50 cursor-not-allowed"
										: "hover:bg-white/50 dark:hover:bg-gray-700/50 opacity-100 hover:scale-110"
								}`}
								aria-label="Dashboard options"
							>
								<MoreVertical
									size={18}
									className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
								/>
							</button>
						</div>
					</div>

					{/* Enhanced Description */}
					<div className="mb-5">
						<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
							{dashboard.description ||
								"✨ A beautifully crafted dashboard ready for your team's collaboration and productivity."}
						</p>
					</div>

					{/* Enhanced Stats Section */}
					<div className="bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
						<div className="flex items-center justify-between">
							{/* Members count with enhanced styling */}
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800">
									<Users
										size={16}
										className="text-blue-600 dark:text-blue-400"
									/>
								</div>
								<div>
									<div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
										{dashboard.members?.length || 0} Member
										{dashboard.members?.length !== 1 ? "s" : ""}
									</div>
									<div className="text-xs text-gray-500 dark:text-gray-400">
										Team size
									</div>
								</div>
							</div>

							{/* Dashboard Type Badge */}
							<div className="text-right">
								<div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
									Dashboard
								</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">
									{isActive ? "Currently Active" : "Available"}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Delete Modal */}
			{showDeleteModal &&
				ReactDOM.createPortal(
					<div
						className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
						onClick={(e) => {
							// Only close if clicking the backdrop, not the modal content
							if (e.target === e.currentTarget) {
								console.log("🚪 Modal backdrop clicked - closing");
								setShowDeleteModal(false);
							}
						}}
					>
						<div className="relative z-[10000] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full">
							{/* Header */}
							<div className="bg-red-500 p-4 rounded-t-xl">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-white/20 rounded-full">
											<Trash2 size={18} className="text-white" />
										</div>
										<h3 className="text-lg font-semibold text-white">
											Delete Dashboard
										</h3>
									</div>
									{/* Close button */}
									<button
										onClick={() => {
											console.log("❌ Close button clicked!");
											setShowDeleteModal(false);
										}}
										className="text-white/80 hover:text-white text-xl font-bold p-1"
									>
										×
									</button>
								</div>
							</div>

							{/* Content */}
							<div className="p-6">
								<div className="text-center mb-6">
									<div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
										<Trash2
											size={24}
											className="text-red-600 dark:text-red-400"
										/>
									</div>
									<h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
										Are you sure?
									</h4>
									<p className="text-gray-600 dark:text-gray-400">
										You're about to delete{" "}
										<strong>"{dashboard.title || dashboard.name}"</strong>. This
										action cannot be undone.
									</p>
								</div>

								<div className="flex gap-3">
									<button
										onClick={handleCancelDelete}
										disabled={loading}
										className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
									>
										Cancel
									</button>
									<button
										onClick={handleConfirmDelete}
										disabled={loading}
										className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
									>
										{loading ? "Deleting..." : "Delete"}
									</button>
								</div>
							</div>
						</div>
					</div>,
					document.body
				)}

			{/* Dropdown Portal */}
			{showDropdown &&
				ReactDOM.createPortal(
					<div
						style={{
							position: "absolute",
							top: dropdownPos.top,
							left: dropdownPos.left,
							zIndex: 10001,
						}}
						className="w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden pointer-events-auto"
						onMouseDown={(e) => e.stopPropagation()}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="py-2">
							<button
								type="button"
								onMouseDown={(e) => {
									e.preventDefault();
									e.stopPropagation();
									handleDeleteClick(e);
								}}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									handleDeleteClick(e);
								}}
								className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50/80 dark:hover:bg-red-900/20 flex items-center gap-3 transition-all duration-200 hover:translate-x-1"
							>
								<div className="p-1 bg-red-100 dark:bg-red-900/30 rounded">
									<Trash2
										size={14}
										className="text-red-600 dark:text-red-400"
									/>
								</div>
								<span className="font-medium">Delete Dashboard</span>
							</button>
						</div>
					</div>,
					document.body
				)}

			{/* Click outside to close dropdown */}
			{showDropdown && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setShowDropdown(false)}
				></div>
			)}
		</>
	);
};

export default BoardCard;
