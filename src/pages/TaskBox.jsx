import { useSortable } from "@dnd-kit/sortable";
import React from "react";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "../components/ui/TaskCard";

const TaskBox = ({ id, setTasks , onDelete, ...task}) => {
	const { attributes, listeners, setNodeRef, transform, transition, active } =
		useSortable({ id: id });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		cursor: active ? "grabbing" : "grab",
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className=" mt-5 "
		>
			<div style={{ touchAction: "none" }}>
				<TaskCard task={task} onDelete={onDelete}></TaskCard>
			</div>
		</div>
	);
};

export default TaskBox;
