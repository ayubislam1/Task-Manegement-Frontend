import React, { useState, useEffect } from "react";
import TaskBox from "./TaskBox";
import {
	closestCorners,
	DndContext,
	MouseSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	rectSwappingStrategy,
	SortableContext,
} from "@dnd-kit/sortable";
import useTask from "../hooks/useTask";

const TaskManage = () => {
	const [tasks] = useTask();
	const [data, setData] = useState([]);

	// Update the data when tasks are fetched
	useEffect(() => {
		if (tasks?.length) setData(tasks);
	  }, [tasks]);

	const getPosition = (id) => data.findIndex((obj) => obj.id === id);

	const handleDnd = (e) => {
		const { active, over } = e;

		if (active.id === over.id) return;

		setData(() => {
			const originalPosition = getPosition(active.id);
			const latestPosition = getPosition(over.id);
			return arrayMove(data, originalPosition, latestPosition);
		});
	};

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 10,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
			  delay: 250, // Add slight delay for touch
			  tolerance: 5,
			}
		  }),
		useSensor(MouseSensor)
	);

	return (
		<div>
			
				<DndContext
					sensors={sensors}
					onDragEnd={handleDnd}
					collisionDetection={closestCorners}
				>
					<SortableContext strategy={rectSwappingStrategy} items={data}>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 justify-between  ">
							{data.map((e) => (
								<TaskBox key={e._id} {...e} onDelete={(id) => setData(tasks.filter(t => t._id !== id))}></TaskBox>
							))}
						</div>
					</SortableContext>
				</DndContext>
			
		</div>
	);
};

export default TaskManage;
