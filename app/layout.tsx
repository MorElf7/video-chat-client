"use client";

// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useEffect } from "react";
import useSWR from "swr";
import "./globals.css";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { UserDto } from "./interfaces/IUser";
import client from "./utils/axiosClient";
import { config } from "./utils/config";
import { fetcher } from "./utils/fetcher";

const inter = Inter({ subsets: ["latin"] });
export const AuthenticationContext = createContext<{ userProfile: UserDto; token: string, mutate: any }>({
	userProfile: {} as UserDto,
	token: "",
	mutate: () => {}
});
// export const metadata: Metadata = {
// 	title: "Chat",
// 	viewport: "width=device-width, initial-scale=1",
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [token, setToken] = useLocalStorage<string>("token", "");
	const [refreshToken, setRefreshToken] = useLocalStorage<string>("refreshToken", "");
	const [refresh, setRefresh] = useLocalStorage<boolean>("refresh", false);

	const { data, mutate } = useSWR([`${config.cloud.uri}/api/auth/user`, token, setRefresh], fetcher);
	const userProfile: UserDto = data?.data;
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
		if (refresh) {
			getNewAccessToken();
		}
	}, [refresh]);

	return (
		<html lang="en">
			<head>
				<title>Chat</title>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<body suppressHydrationWarning={true} className={inter.className}>
				<AuthenticationContext.Provider value={{ userProfile, token, mutate }}>
					{children}
				</AuthenticationContext.Provider>
			</body>
		</html>
	);
}
