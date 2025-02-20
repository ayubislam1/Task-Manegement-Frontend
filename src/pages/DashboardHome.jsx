import React from 'react';
import {Button} from "@/components/ui/button"

const DashboardHome = () => {
    return (
        <div className='flex items-center'>
            <h1 className='text-xl font-bold'>Task</h1>
            <Button className="bg-blue-600">+Create Task</Button>
        </div>
    );
};

export default DashboardHome;