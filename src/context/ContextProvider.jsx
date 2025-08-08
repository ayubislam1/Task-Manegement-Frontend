import { createContext, useEffect, useState } from "react";
import {
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithPopup,
	signOut,
} from "firebase/auth";

import useAxiosPublic from "../hooks/useAxiosPublic";
import auth from "../services/firebase.config";
import { DashboardProvider } from "./DashboardContext";
import { BoardProvider } from "./BoardContext";
import { TaskProvider } from "./TaskContext";
import { connectSocket, disconnectSocket } from "../socket/socket"; // Import socket functions

export const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

const ContextProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const axiosPublic = useAxiosPublic();

	const googleSignIn = () => {
		setLoading(true);
		return signInWithPopup(auth, googleProvider);
	};

	const logOut = () => {
		setLoading(true);
		disconnectSocket(); // Disconnect socket on logout
		return signOut(auth);
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			if (currentUser) {
				// Connect to socket when user is authenticated with both userId and userEmail
				connectSocket(currentUser.uid, currentUser.email);

				// Store user in database if new
				axiosPublic
					.post(`http://localhost:5000/all-users`, {
						uid: currentUser.uid,
						email: currentUser.email,
						displayName: currentUser.displayName,
						photoURL: currentUser.photoURL,
					})
					.catch(console.error);
			} else {
				// Disconnect socket when user is not authenticated
				disconnectSocket();
			}
			setLoading(false);
		});

		return () => {
			unsubscribe();
			disconnectSocket(); // Clean up socket connection on unmount
		};
	}, [axiosPublic]);

	const authInfo = {
		user,
		loading,
		googleSignIn,
		logOut,
	};

	return (
		<AuthContext.Provider value={authInfo}>
			<BoardProvider>
				<TaskProvider>
					<DashboardProvider>{children}</DashboardProvider>
				</TaskProvider>
			</BoardProvider>
		</AuthContext.Provider>
	);
};

export default ContextProvider;
