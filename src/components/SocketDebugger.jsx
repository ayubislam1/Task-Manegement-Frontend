import React, { useEffect, useState } from 'react';
import { socket } from '../socket/socket';

const SocketDebugger = () => {
	const [socketStatus, setSocketStatus] = useState('disconnected');
	const [events, setEvents] = useState([]);

	useEffect(() => {
		// Monitor socket connection status
		const updateStatus = () => {
			setSocketStatus(socket.connected ? 'connected' : 'disconnected');
		};

		socket.on('connect', () => {
			console.log('🔗 Socket connected in debugger');
			setSocketStatus('connected');
			addEvent('Socket connected', socket.id);
		});

		socket.on('disconnect', () => {
			console.log('🔌 Socket disconnected in debugger');
			setSocketStatus('disconnected');
			addEvent('Socket disconnected', 'N/A');
		});

		// Listen for all dashboard events
		socket.on('dashboard_task_created', (data) => {
			addEvent('Dashboard Task Created', data);
		});

		socket.on('team_member_added', (data) => {
			addEvent('Team Member Added', data);
		});

		socket.on('dashboard_created', (data) => {
			addEvent('Dashboard Created', data);
		});

		socket.on('dashboard_member_role_updated', (data) => {
			addEvent('Member Role Updated', data);
		});

		socket.on('dashboard_member_removed', (data) => {
			addEvent('Member Removed', data);
		});

		updateStatus();

		return () => {
			socket.off('connect');
			socket.off('disconnect');
			socket.off('dashboard_task_created');
			socket.off('team_member_added');
			socket.off('dashboard_created');
			socket.off('dashboard_member_role_updated');
			socket.off('dashboard_member_removed');
		};
	}, []);

	const addEvent = (eventType, data) => {
		const timestamp = new Date().toLocaleTimeString();
		setEvents(prev => [{
			id: Date.now(),
			timestamp,
			eventType,
			data
		}, ...prev.slice(0, 9)]); // Keep only last 10 events
	};

	const clearEvents = () => {
		setEvents([]);
	};

	return (
		<div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto z-50">
			<div className="flex justify-between items-center mb-3">
				<h3 className="font-semibold text-lg">Socket Debugger</h3>
				<button 
					onClick={clearEvents}
					className="text-sm bg-red-500 text-white px-2 py-1 rounded"
				>
					Clear
				</button>
			</div>
			
			<div className="mb-3">
				<div className="flex items-center space-x-2">
					<div 
						className={`w-3 h-3 rounded-full ${
							socketStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
						}`}
					></div>
					<span className="text-sm font-medium">
						{socketStatus === 'connected' ? 'Connected' : 'Disconnected'}
					</span>
				</div>
				{socket.id && (
					<div className="text-xs text-gray-500 mt-1">
						ID: {socket.id}
					</div>
				)}
			</div>

			<div className="space-y-2">
				<h4 className="font-medium text-sm">Recent Events:</h4>
				{events.length === 0 ? (
					<p className="text-xs text-gray-500">No events yet...</p>
				) : (
					events.map(event => (
						<div key={event.id} className="bg-gray-50 p-2 rounded text-xs">
							<div className="font-medium text-blue-600">
								{event.eventType}
							</div>
							<div className="text-gray-500">
								{event.timestamp}
							</div>
							<div className="mt-1 font-mono text-xs bg-gray-100 p-1 rounded max-h-16 overflow-y-auto">
								{typeof event.data === 'string' 
									? event.data 
									: JSON.stringify(event.data, null, 2)
								}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default SocketDebugger;
