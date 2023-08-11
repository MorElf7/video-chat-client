"use client"

import { AuthenticationContext } from "@/components/AuthenticationProvider";
import { SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { DataResponse, PageResponse } from "../interfaces/IResponse";
import { RoomDto, SaveRoomRequest } from "../interfaces/IRoom";
import { UserDto } from "../interfaces/IUser";
import client from "../utils/axiosClient";
import { config } from "../utils/config";
import { reachBottom } from "../utils/scrollEventHandler";

function UserDropdown({
	user,
	setUsersSelected,
}: {
	user: UserDto;
	setUsersSelected: (newState: SetStateAction<UserDto[]>) => void;
}) {
	return (
		<div
			className="cursor-pointer w-full border-gray-300 rounded-t border-b hover:bg-teal-100"
			onClick={() => {
				setUsersSelected((old: UserDto[]) => {
					if (old.find((item) => item.id === user.id)) {
						return old;
					} else return [...old, user];
				});
			}}>
			<div className="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-teal-100">
				<div className="w-full items-center flex">
					<div className="mx-2 leading-6 ">{user.username} </div>
				</div>
			</div>
		</div>
	);
}

function UserSelected({
	user,
	setUsersSelected,
}: {
	user: UserDto;
	setUsersSelected: (newState: SetStateAction<UserDto[]>) => void;
}) {
	return (
		<div className="flex justify-center items-center m-1 font-medium py-1 px-2 rounded-full text-teal-700 bg-teal-100 border border-teal-300 ">
			<div className="text-xs font-normal leading-none max-w-full flex-initial">
				{user.username}
			</div>
			<div className="flex flex-auto flex-row-reverse">
				<div>
					<svg
						onClick={() => {
							setUsersSelected((old: UserDto[]) => old.filter((e) => e.id !== user.id));
						}}
						xmlns="http://www.w3.org/2000/svg"
						width="100%"
						height="100%"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="feather feather-x cursor-pointer hover:text-teal-400 rounded-full w-4 h-4 ml-2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</div>
			</div>
		</div>
	);
}

const initialRoom: SaveRoomRequest = {
	name: "",
	users: [],
	type: "chat",
	avatar: "",
	description: "",
};

const getUsers = async (
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
	})) as unknown as PageResponse<UserDto>;
};

export default function ({
	open,
	setOpen,
	handleActiveRoom,
}: {
	open: boolean;
	setOpen: (newState: SetStateAction<boolean>) => void;
	handleActiveRoom: (s: string) => void;
}) {
	const [payload, setPayload] = useState<SaveRoomRequest>(initialRoom);
	const [page, setPage] = useState<number>(0);
	const { token } = useContext(AuthenticationContext);
	const [refresh, setRefresh] = useLocalStorage<boolean>("refresh", false);
	const usersData = useSWRMutation(`${config.cloud.uri}/api/user`, getUsers);
	const [usersDropdown, setUsersDropdown] = useState<boolean>(false);
	const [users, setUsers] = useState<UserDto[]>([]);
	const [usersSelected, setUsersSelected] = useState<UserDto[]>([]);

	const handleResetModal = useCallback(() => {
		setUsersSelected([]);
		setUsersDropdown(false);
		setPayload(initialRoom);
	}, []);

	useEffect(() => {
		if (!open) {
			handleResetModal();
		} else {
			usersData.trigger({ token, page, pageSize: 20 });
		}
	}, [open]);

	useEffect(() => {
		setPayload((old: SaveRoomRequest) => {
			return { ...old, users: usersSelected.map((item) => item.id) };
		});
	}, [usersSelected]);

	useEffect(() => {
		if (page !== 0) usersData.trigger({ token, page, pageSize: 20 });
	}, [page]);

	useEffect(() => {
		if (usersData.error) {
			setRefresh(true);
		} else {
			if (page === 0) {
				if (usersData.data?.data) {
					setUsers(usersData.data.data);
				}
			} else {
				setUsers((old) => {
					if (!usersData.data?.data) return old;
					return [...old, ...usersData.data?.data];
				});
			}
		}
	}, [usersData.data]);

	const handleCreateRoom = async (payload: SaveRoomRequest) => {
		const SaveRoomRequest = (await client.post(`${config.cloud.uri}/api/room`, payload, {
			headers: { Authorization: `Bearer ${token}` },
		})) as DataResponse<RoomDto>;
		handleActiveRoom(SaveRoomRequest.data.id);
		return SaveRoomRequest.data;
	};

	const handleChange = useCallback((e: any) => {
		e.preventDefault();
		setPayload((old: SaveRoomRequest) => {
			return { ...old, [e.target.name]: e.target.value };
		});
	}, []);

	const handleEnterUser = async (e: any) => {
		if (e.key === "Enter") {
			const username = e.target.value;
			const data = (await client.get(`${config.cloud.uri}/api/user`, {
				headers: { Authorization: `Bearer ${token}` },
				params: {
					page: 0,
					pageSize: 10,
					textSearch: username,
				},
			})) as unknown as PageResponse<UserDto>;
			const users = data.data;
			if (users.length > 0) {
				const user = users[0];
				setUsersSelected((old: UserDto[]) => {
					if (old.find((item) => item.id === user.id)) {
						return old;
					} else return [...old, user];
				});
			}
			e.target.value = "";
		}
	};

	const handleCreateChat = async () => {
		const SaveRoomRequest = await handleCreateRoom(payload);
		handleActiveRoom(SaveRoomRequest.id);
		setOpen(false);
	};

	return open ? (
		<div
			className="transition-all ease-in-out relative z-10"
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="false">
			<div className="fixed inset-0 z-10 overflow-y-auto overscroll-contain max-h-1/2 max-w-1/2">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<div
						className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ease-in-out"
						onClick={() => {
							handleResetModal();
							setOpen(false);
						}}></div>
					<div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all ease-in-out sm:my-8 sm:w-full sm:max-w-lg">
						<div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
							<div className="">
								<div className="mx-auto flex h-10 w-full flex-shrink-0 items-start justify-center rounded-full ">
									<svg
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6 "
										aria-hidden="true">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"></path>
									</svg>
									<h3
										className="mx-1 text-base font-semibold leading-6 text-gray-900"
										id="modal-title">
										New Chat
									</h3>
								</div>
								<div className=" text-center h-full">
									<div className="my-2">
										<div>
											<input
												type="text"
												name="name"
												id="name"
												className="bg-gray-50 border border-gray-300 text-black sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-200 dark:border-gray-500 dark:placeholder-gray-400"
												placeholder="Chat name"
												value={payload.name}
												required={true}
												onChange={handleChange}
											/>
										</div>

										<div className="mt-2 w-full  flex flex-col items-center h-64 ">
											<div className="w-full">
												<div className="flex flex-col items-center relative">
													<div className="w-full  svelte-1l8159u">
														<div className=" flex bg-gray-50 border border-gray-300 text-black sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-1 dark:bg-slate-200 dark:border-gray-500 dark:placeholder-gray-400">
															<div className="flex flex-auto flex-wrap">
																{usersSelected?.length > 0 &&
																	usersSelected.map((e: UserDto, index: number) => (
																		<UserSelected
																			user={e}
																			key={index}
																			setUsersSelected={setUsersSelected}
																		/>
																	))}
																<div className="flex-1">
																	<input
																		id="userSelected"
																		placeholder="To"
																		onKeyDown={handleEnterUser}
																		className="bg-transparent appearance-none outline-none h-full w-full text-gray-800 pl-2"
																	/>
																</div>
															</div>
															<div className="text-gray-300 w-8 py-1 pl-2 pr-1 border-l flex items-center border-gray-200 svelte-1l8159u">
																<button
																	className="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none"
																	onClick={() => {
																		setUsersDropdown(!usersDropdown);
																	}}>
																	{usersDropdown ? (
																		<svg
																			xmlns="http://www.w3.org/2000/svg"
																			fill="none"
																			viewBox="0 0 24 24"
																			strokeWidth="1.5"
																			stroke="currentColor"
																			className="w-5 h-5">
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				d="M4.5 15.75l7.5-7.5 7.5 7.5"
																			/>
																		</svg>
																	) : (
																		<svg
																			xmlns="http://www.w3.org/2000/svg"
																			fill="none"
																			viewBox="0 0 24 24"
																			strokeWidth="1.5"
																			stroke="currentColor"
																			className="w-5 h-5">
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				d="M19.5 8.25l-7.5 7.5-7.5-7.5"
																			/>
																		</svg>
																	)}
																</button>
															</div>
														</div>
													</div>
													<div
														className="mt-2 shadow top-100 bg-white z-40 w-full lef-0 rounded max-h-select overflow-y-auto overscroll-contain svelte-5uyqqj"
														onScroll={(e) => {
															if (reachBottom(e)) {
																setPage((old) => old + 1);
															}
														}}>
														{usersDropdown && (
															<div className="flex flex-col w-full overflow-auto overscroll-contain h-60">
																{users?.length > 0 &&
																	users.map((e: UserDto, index: number) => (
																		<UserDropdown
																			key={index}
																			user={e}
																			setUsersSelected={setUsersSelected}
																		/>
																	))}
															</div>
														)}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
							<button
								onClick={handleCreateChat}
								type="button"
								className="inline-flex w-full justify-center rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 sm:ml-3 sm:w-auto">
								Create
							</button>
							<button
								type="button"
								onClick={() => {
									setOpen(false);
								}}
								className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	) : (
		<></>
	);
}
