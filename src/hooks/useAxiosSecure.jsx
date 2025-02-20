import axios from "axios";
import { useNavigate } from "react-router";
import useAuth from "./useAuth";


const axiosSecure = axios.create({
	baseURL: "http://localhost:3000",
});
const useAxiosSecure = () => {
	const navigate = useNavigate();
	const { logOut } = useAuth();
	axiosSecure.interceptors.request.use(
		async (config) => {
			const token = localStorage.getItem("access-token");

			if (token) {
				config.headers.authorization = `Bearer ${token}`;
			} else {
				console.log("No token found");
			}

			return config;
		},
		function (error) {
			return Promise.reject(error);
		}
	);
	axiosSecure.interceptors.response.use(
		function (response) {
			return response;
		},
		async (error) => {
			const status = error.response.status;

			if (status === 401 || status === 403) {
				await logOut();
				navigate("/login");
			}
			return Promise.reject(error);
		}
	);
	return axiosSecure;
};

export default useAxiosSecure;
