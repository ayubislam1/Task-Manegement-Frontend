import { useContext } from "react";
import { AuthContext } from "../context/ContextProvider";

export const useAuth = () => {
	const auth = useContext(AuthContext);
	return auth;
};
