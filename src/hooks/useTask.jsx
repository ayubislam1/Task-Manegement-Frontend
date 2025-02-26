import useAxiosPublic from "./useAxiosPublic";
import { useQuery } from "@tanstack/react-query";
const useTask = () => {
	const axiosPublic = useAxiosPublic();

	const {
		data: tasks = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["tasks"],
		queryFn: async () => {
			const res = await axiosPublic.get(`/tasks`);

			return res.data;
		},
	});
	return [tasks, isLoading, refetch];
};

export default useTask;
