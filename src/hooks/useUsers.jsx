import React, { useEffect, useState } from "react";
import useAxiosPublic from "./useAxiosPublic";
import { useQuery } from "@tanstack/react-query";
const useUsers = () => {
	const axiosPublic = useAxiosPublic();

	const {
		data: userData = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["userData"],
		queryFn: async () => {
			const res = await axiosPublic.get(`/all-users`);
			console.log(res.data);
			return res.data;
			
		},
	});
	return [userData, isLoading, refetch];
};

export default useUsers;
