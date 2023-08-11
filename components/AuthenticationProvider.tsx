"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DataResponse } from "@/interfaces/IResponse";
import client from "@/utils/axiosClient";
import { config } from "@/utils/config";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import { UserDto } from "../interfaces/IUser";

export const AuthenticationContext = createContext<{
	userProfile: UserDto;
	token: string;
	mutate: any;
}>({
	userProfile: {} as UserDto,
	token: "",
	mutate: () => {},
});

const getUserProfile = async (url: string, { arg }: { arg: { token: string } }) => {
	return (await client.get(url, {
		headers: {
			Authorization: `Bearer ${arg.token}`,
		},
	})) as unknown as DataResponse<UserDto>;
};

const initialProfile = {
	id: "",
	username: "",
	firstName: "",
	lastName: "",
	password: "",
	newPassword: "",
	bio: "",
	avatar: "",
	email: "",
	phone: "",
} as unknown as UserDto;

export default function ({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [token, setToken] = useLocalStorage<string>("token", "");
	const [refreshToken, setRefreshToken] = useLocalStorage<string>("refreshToken", "");
	const [refresh, setRefresh] = useLocalStorage<boolean>("refresh", false);
	const { data, trigger, error } = useSWRMutation(
		`${config.cloud.uri}/api/auth/user`,
		getUserProfile
	);
	const [userProfile, setUserProfile] = useState<UserDto>(() => data?.data || initialProfile);
	const getNewAccessToken = useCallback(() => {
		client
			.post(`${config.cloud.uri}/api/auth/token`, { token: refreshToken })
			.then((res: any) => {
				if (res.token) {
					setToken(res.token);
					setRefresh(false);
				}
			})
			.catch(() => {
				setRefresh(false);
				router.push("/login");
			});
	}, [refreshToken]);

	useEffect(() => {
		if (token && token !== "") {
			trigger({ token });
			if (error) {
				setRefresh(true);
			}
		}
	}, [token]);

	useEffect(() => {
		if (data?.data) setUserProfile(data.data);
	}, [data]);

	useEffect(() => {
		if (refresh) {
			getNewAccessToken();
		}
	}, [refresh]);

	const mutate = () => {
		trigger({ token });
	};

	return (
		<AuthenticationContext.Provider value={{ userProfile, token, mutate }}>
			{children}
		</AuthenticationContext.Provider>
	);
}
