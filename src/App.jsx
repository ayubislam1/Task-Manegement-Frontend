import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Button } from "@/components/ui/button.tsx";
import { RouterProvider } from "react-router-dom";
import router from "./router/router";
import { ThemeProvider } from "./components/ui/theme-provider";
import ContextProvider from "./context/ContextProvider";
import { Toaster } from "react-hot-toast";
import { TaskProvider } from "./context/TaskContext";
import SocketDebugger from "./components/SocketDebugger";

function App() {
	return (
		<ThemeProvider defaultTheme="dark">
			<ContextProvider>
				<TaskProvider>
					<RouterProvider router={router} />
					<Toaster position="top-right" />
					{/* Add Socket Debugger in development */}
					{import.meta.env.DEV && <SocketDebugger />}
				</TaskProvider>
			</ContextProvider>
		</ThemeProvider>
	);
}

export default App;
