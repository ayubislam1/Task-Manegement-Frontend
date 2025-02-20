import React from 'react';
import { Outlet } from 'react-router';

const MainLayOut = () => {
    return (
        <div className='my-auto '>
            <Outlet></Outlet>
        </div>
    );
};

export default MainLayOut;