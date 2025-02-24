import React from 'react';

const Modal = ({user,userData,name,photo}) => {
    return (
        <div>
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
						<form onSubmit={(e) => e.preventDefault()}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700">
									Name
								</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700">
									Email
								</label>
								<input
									type="email"
									value={user?.email}
									disabled
									className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700">
									Profile Picture
								</label>
								<input
									type="text"
									value={photo}
									onChange={(e) => setPhoto(e.target.value)}
									className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
							<div className="flex justify-end">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={() => handleSave(userData?._id)}
									className="px-4 py-2 bg-blue-600 text-white rounded-md"
								>
									Save
								</button>
							</div>
						</form>
					</div>
				</div>
        </div>
    );
};

export default Modal;