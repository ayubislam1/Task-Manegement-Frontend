import React, { useEffect, useState } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { useParams } from "react-router";

const TaskDetails = () => {
    const axiosPublic = useAxiosPublic();
    const [task, setTask] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        axiosPublic.get(`/tasks/${id}`).then((res) => setTask(res.data[0]));
    }, [axiosPublic, id]);

    if (!task) {
        return <div className="flex justify-center items-center  text-lg">Loading...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white  rounded-lg mt-10">
            <div className="flex items-center space-x-4">
                <img 
                    src={task.photoURL} 
                    alt={task.user} 
                    className="w-16 h-16 rounded-full border border-gray-300"
                />
                <div>
                    <h1 className="text-2xl font-semibold">{task.title}</h1>
                    <p className="text-gray-600">Assigned to: <span className="font-medium">{task.user}</span></p>
                </div>
            </div>
            <div className="mt-4">
                <p className="text-gray-800 text-lg">{task.description}</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-600">Category</p>
                    <p className="font-medium">{task.category}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-600">Priority</p>
                    <p className="font-medium text-red-500">{task.priority}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg col-span-2">
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-medium">{new Date(task.date).toDateString()}</p>
                </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
                <p className="text-gray-500 text-sm">Created on: {new Date(task.timestamp).toLocaleString()}</p>
                <p className="text-gray-500 text-sm">User Email: {task.email}</p>
            </div>
        </div>
    );
};

export default TaskDetails;
