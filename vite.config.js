import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	css: {
		postcss: "./postcss.config.cjs",
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		proxy: {
			"/dashboard-tasks": "http://localhost:5000", // Change 5000 to your backend port if different
			"/tasks": "http://localhost:5000", // (optional) proxy for other task endpoints
			"/dashboard-update": "http://localhost:5000", // Add proxy for dashboard update endpoint
			"/dashboards": "http://localhost:5000", // Add proxy for other dashboard endpoints
			"/task-delete": "http://localhost:5000", // Add proxy for task deletion
		},
	},
});
