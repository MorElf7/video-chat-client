"use client";

import { AuthenticationContext } from "@/components/AuthenticationProvider";
import defaultPic from "@/public/avatar-default.png";
import client from "@/utils/axiosClient";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { NotificationDto } from "../interfaces/INotification";
import { PageResponse } from "../interfaces/IResponse";
import { config } from "../utils/config";
import { reachBottom } from "../utils/scrollEventHandler";
import NotificationBox from "./NotificationBox";

const getNotifications = async (
	url: string,
	{ arg }: { arg: { token: string; page: number; pageSize: number } }
) => {
	return (await client.get(url, {
		headers: {
			Authorization: `Bearer ${arg.token}`,
		},
		params: {
			page: arg.page,
			pageSize: arg.pageSize,
		},
	})) as unknown as PageResponse<NotificationDto>;
};

export default function ({ handleActiveRoom }: { handleActiveRoom?: (s: string) => void }) {
	const [token, setToken] = useLocalStorage("token", "");
	const [refresh, setRefresh] = useLocalStorage<boolean>("refresh", false);
	const [rightPopUpActive, setRightPopUpActive] = useState<boolean>(false);
	const [leftPopUpActive, setLeftPopUpActive] = useState<boolean>(false);
	const router = useRouter();
	const authentication = useContext(AuthenticationContext);
	const [notificationActive, setNotificationActive] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [notifications, setNotifications] = useState<NotificationDto[]>([]);

	const notificationsData = useSWR(
		`${config.cloud.uri}/api/notification`,
		getNotifications
	);
	const data = notificationsData.data as unknown as PageResponse<NotificationDto>;
	const totalNotifications = data?.totalElements;

	useEffect(() => {
		notificationsData.mutate();
	}, [page]);

	useEffect(() => {
		if (data?.data) {
			if (page === 0) {
				setNotifications(data.data);
			} else {
				setNotifications((old) => [...old, ...data.data]);
			}
		}
	}, [data]);

	const handleSignout = (e: any) => {
		e.preventDefault();
		setRightPopUpActive(false);
		setToken("");
		router.push("/login");
	};

	const handleNotifications = (roomId: string) => {
		setNotificationActive(false);
		notificationsData.mutate();
		if (handleActiveRoom) handleActiveRoom(roomId);
	};

	return (
		<nav className="bg-gray-800 h-fit">
			<div className="mx-auto max-w-20xl px-2 sm:px-6 lg:px-8">
				<div className="relative flex h-16 items-center justify-between">
					<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
						<button
							type="button"
							className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
							aria-controls="mobile-menu"
							aria-expanded={leftPopUpActive}
							onClick={() => setLeftPopUpActive(!leftPopUpActive)}>
							<span className="absolute -inset-0.5"></span>
							<span className="sr-only">Open main menu</span>
							{leftPopUpActive ? (
								<svg
									className="block h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									aria-hidden="true">
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							) : (
								<svg
									className="block h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									aria-hidden="true">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
									/>
								</svg>
							)}
						</button>
					</div>
					<div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
						<div className="flex flex-shrink-0 items-center text-gray-300 text-xl">
							<Link href="/">VC</Link>
						</div>
						<div className="hidden sm:ml-6 sm:block ">
							{authentication.userProfile && (
								<div className="flex space-x-4">
									<Link
										href="/"
										className="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium"
										aria-current="page">
										Dashboard
									</Link>
									<Link
										href="/room"
										className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
										Rooms
									</Link>
								</div>
							)}
						</div>
					</div>
					<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
						<div className="relative">
							{authentication.userProfile && (
								<button
									onClick={() => {
										setNotificationActive((old) => !old);
									}}
									type="button"
									className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none ">
									<svg
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="1.5"
										stroke="currentColor"
										aria-hidden="true">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
										/>
									</svg>
									{totalNotifications > 0 && (
										<div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-2 -right-2 ">
											{totalNotifications}
										</div>
									)}
								</button>
							)}

							{notificationActive && (
								<div
									onScroll={(e) => {
										if (reachBottom(e)) {
											setPage((old) => old + 1);
										}
									}}
									className="absolute overflow-y-auto overscroll-contain right-0 z-10 mt-2 w-[400px] origin-top-right rounded-md ">
									{notifications?.length > 0 &&
										notifications.map((noti, i) => (
											<NotificationBox
												notification={noti}
												key={i}
												handleNotifications={handleNotifications}
											/>
										))}
								</div>
							)}
						</div>

						<div className="relative ml-3">
							{authentication.userProfile && (
								<div>
									<button
										type="button"
										className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
										id="user-menu-button"
										aria-expanded={rightPopUpActive}
										aria-haspopup="true"
										onClick={() => {
											setRightPopUpActive(!rightPopUpActive);
										}}>
										<span className="absolute -inset-1.5"></span>
										<span className="sr-only">Open user menu</span>
										<Image
											className="h-8 w-8 rounded-full"
											src={authentication.userProfile?.avatar || defaultPic}
											alt="Profile Avatar"
											width={256}
											height={256}
										/>
									</button>
								</div>
							)}

							{rightPopUpActive && (
								<div
									className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
									role="menu"
									aria-orientation="vertical"
									aria-labelledby="user-menu-button"
									tabIndex={-1}>
									<Link
										href="/setting"
										className="block px-4 py-2 text-sm text-gray-600 hover:text-black"
										role="menuitem"
										tabIndex={-1}
										id="user-menu-item-0">
										Settings
									</Link>
									<Link
										href="#"
										className="block px-4 py-2 text-sm text-gray-600 hover:text-black"
										role="menuitem"
										tabIndex={-1}
										id="user-menu-item-1"
										onClick={handleSignout}>
										Sign out
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{leftPopUpActive && (
				<div className="sm:hidden" id="mobile-menu">
					<div className=" space-y-1 px-2 pb-3 pt-2">
						<Link
							href="/"
							className="bg-gray-900 text-white block rounded-md px-3 py-2 text-base font-medium"
							aria-current="page">
							Dashboard
						</Link>
						<Link
							href="/room"
							className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">
							Rooms
						</Link>
					</div>
				</div>
			)}
		</nav>
	);
}
