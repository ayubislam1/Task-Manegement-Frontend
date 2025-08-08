import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ui/theme-provider.jsx";
import ContextProvider from "./context/ContextProvider.jsx";


document.body.classList.add("preload");


window.addEventListener("load", () => {
	document.body.classList.remove("preload");
});

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
mediaQuery.addListener(() => {
	const root = document.documentElement;
	if (root.classList.contains("system")) {
		root.classList.remove("light", "dark");
		root.classList.add(mediaQuery.matches ? "dark" : "light");
	}
});

const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ContextProvider>
			<ThemeProvider>
				<QueryClientProvider client={queryClient}>
					<App />
				</QueryClientProvider>
			</ThemeProvider>
		</ContextProvider>
	</StrictMode>
);
