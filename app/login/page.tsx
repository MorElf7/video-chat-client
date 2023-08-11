"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { LoginRequest, LoginResponse } from "../../interfaces/IAuth";
import client from "../../utils/axiosClient";
import { config } from "../../utils/config";
import { AuthenticationContext } from "@/components/AuthenticationProvider";

export default function Login() {
	const [payload, setPayload] = useState({
		username: "",
		password: "",
	} as LoginRequest);
	const [remember, setRemember] = useState(false);
	const [token, setToken] = useLocalStorage("token", "");
	const { userProfile } = useContext(AuthenticationContext);
	const [refreshToken, setRefreshToken] = useLocalStorage("refreshToken", "");
	const router = useRouter();

	useEffect(() => {
		if (userProfile && token !== "") {
			router.push("/");
		}
	}, [userProfile]);

	const handleChange = useCallback((e: any) => {
		e.preventDefault();
		setPayload((old: LoginRequest) => {
			return { ...old, [e.target.name]: e.target.value };
		});
	}, []);

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		const res = (await client.post(`${config.cloud.uri}/api/auth/login`, payload)) as LoginResponse;
		setToken(res.token);
		remember && setRefreshToken(res.refreshToken);
		router.push("/");
	};

	return (
		<div className="flex items-center justify-stretch h-full">
			<div className="max-w-2xl w-96 mx-auto ">
				<div className="bg-white shadow-md border border-gray-200 rounded-lg max-w-sm p-4 sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700">
					<form action="#" className="space-y-6">
						<h3 className="text-xl font-medium text-gray-900 dark:text-white">
							Sign in to our platform
						</h3>
						<div>
							<label
								htmlFor="username"
								className="text-sm font-medium text-gray-900 block mb-2 dark:text-gray-300">
								Username
							</label>
							<input
								type="username"
								name="username"
								id="username"
								className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
								placeholder="Your username"
								required={true}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label
								htmlFor="password"
								className="text-sm font-medium text-gray-900 block mb-2 dark:text-gray-300">
								Password
							</label>
							<input
								type="password"
								name="password"
								id="password"
								placeholder="Your password"
								className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
								required={true}
								onChange={handleChange}
							/>
						</div>
						<div className="flex items-start">
							<div className="flex items-start">
								<div className="flex items-center h-5">
									<input
										id="remember"
										aria-describedby="remember"
										type="checkbox"
										className="bg-gray-50 border border-gray-300 focus:ring-3 focus:ring-blue-300 h-4 w-4 rounded dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
										required={false}
										value="false"
										onChange={(e) => {
											setRemember(e.target.checked);
										}}
									/>
								</div>
								<div className="text-sm ml-3">
									<label
										htmlFor="remember"
										className="font-medium text-gray-900 dark:text-gray-300">
										Remember me
									</label>
								</div>
							</div>
						</div>
						<button
							type="submit"
							className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
							onClick={handleSubmit}>
							Login to your account
						</button>
						<div className="text-sm font-medium text-gray-500 dark:text-gray-300">
							Not registered?{" "}
							<Link href="/signup" className="text-blue-700 hover:underline dark:text-blue-500">
								Create account
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
