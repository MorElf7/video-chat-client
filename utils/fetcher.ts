import { SetStateAction } from "react";
import client from "./axiosClient";

export const fetcher = ([url, token, setRefresh, params]: [
	url: string,
	token: string,
	setRefresh: (newState: SetStateAction<Boolean>) => {},
	params: any
]) => {
	if (url.includes("/undefined") || url.includes("/null")) return;
	if (url.endsWith("/")) return;
	if (!token || token === "") return;
	return client
		.get(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			params,
		})
		.catch((err) => {
			setRefresh(true);
		});
};
