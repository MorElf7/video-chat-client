"use client";

import { AuthenticationContext } from "@/components/AuthenticationProvider";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import RoomSearchBox from "../../components/RoomSearchBox";
import { PageResponse } from "../../interfaces/IResponse";
import { RoomDto } from "../../interfaces/IRoom";
import client from "../../utils/axiosClient";
import { config } from "../../utils/config";
import { reachBottom } from "../../utils/scrollEventHandler";

const searchRoom = async (
	url: string,
	{ arg }: { arg: { token: string; textSearch: string; page: number; pageSize: number } }
) => {
	return (await client.get(url, {
		headers: {
			Authorization: `Bearer ${arg.token}`,
		},
		params: {
			textSearch: arg.textSearch,
			page: arg.page,
			pageSize: arg.pageSize,
		},
	})) as unknown as PageResponse<RoomDto>;
};

export default function () {
	const [textSearch, setTextSearch] = useState<string>("");
	const [page, setPage] = useState<number>(0);
	const [refresh, setRefresh] = useLocalStorage<boolean>("refresh", false);
	const { trigger, data, error } = useSWRMutation(`${config.cloud.uri}/api/room`, searchRoom);
	const { token, userProfile } = useContext(AuthenticationContext);
	const [rooms, setRooms] = useState<RoomDto[]>([]);
	const router = useRouter();

	const handleMutate = () => {
		trigger({ token, page, pageSize: 20, textSearch });
	};

	useEffect(() => {
		if (token === "" && !userProfile) {
			router.push("/login");
		}
	}, [token, userProfile]);

	useEffect(() => {
		if (page !== 0) handleMutate();
	}, [page]);

	useEffect(() => {
		if (textSearch !== "") {
			setPage(0);
			handleMutate();
		}
	}, [textSearch]);

	useEffect(() => {
		if (error) {
			setRefresh(true);
		} else {
			if (data?.data) {
				if (page === 0) {
					setRooms(data.data);
				} else {
					setRooms((old) => [...old, ...data.data]);
				}
			}
		}
	}, [data]);

	return (
		<div className="flex grow flex-col items-center overflow-y-auto overscroll-contain gap-3">
			<div className="my-8 h-[50px] w-3/5">
				<label
					htmlFor="search"
					className="text-xl ml-2 font-medium text-gray-900 block mb-2 dark:text-gray-300">
					Search
				</label>
				<input
					onChange={(e) => {
						setTextSearch(e.target.value);
					}}
					type="text"
					name="search"
					id="search"
					value={textSearch}
					className="bg-gray-300 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-white focus:border-white block w-full mr-3 ml-2 p-3 "
					placeholder="Search"
				/>
			</div>
			<div
				onScroll={(e) => {
					if (reachBottom(e)) {
						setPage((old) => old + 1);
					}
				}}
				className="flex flex-col w-4/5 max-h-[700px] overflow-y-auto overscroll-contain grow my-5">
				{rooms?.length > 0 &&
					textSearch.length > 0 &&
					rooms.map((e: RoomDto, index: number) => (
						<RoomSearchBox key={index} room={e} handleMutate={handleMutate} />
					))}
			</div>
		</div>
	);
}
