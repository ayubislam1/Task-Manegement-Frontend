import React from "react";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Button } from "./ui/button";

const TaskFilter = ({
	searchQuery,
	onSearchChange,
	statusFilter,
	onStatusChange,
	priorityFilter,
	onPriorityChange,
	onClearFilters,
}) => {
	return (
		<div className="flex flex-col md:flex-row gap-4 mb-6">
			<Input
				type="text"
				placeholder="Search tasks..."
				value={searchQuery}
				onChange={(e) => onSearchChange(e.target.value)}
				className="flex-1"
			/>

			<Select
				value={statusFilter}
				onValueChange={onStatusChange}
				className="w-full md:w-48"
			>
				<option value="">All Status</option>
				<option value="todo">To Do</option>
				<option value="in-progress">In Progress</option>
				<option value="completed">Completed</option>
			</Select>

			<Select
				value={priorityFilter}
				onValueChange={onPriorityChange}
				className="w-full md:w-48"
			>
				<option value="">All Priority</option>
				<option value="low">Low</option>
				<option value="medium">Medium</option>
				<option value="high">High</option>
			</Select>

			<Button
				variant="outline"
				onClick={onClearFilters}
				className="w-full md:w-auto"
			>
				Clear Filters
			</Button>
		</div>
	);
};

export default TaskFilter;
