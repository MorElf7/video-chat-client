"use client";
import { AuthenticationContext } from "@/components/AuthenticationProvider";
import { PageResponse } from "@/interfaces/IResponse";
import client from "@/utils/axiosClient";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { RoomDto } from "../interfaces/IRoom";
import { config } from "../utils/config";
import { fetcher } from "../utils/fetcher";

import ChatWindow from "@/components/ChatWindow";
import DashboardBar from "@/components/DashboardBar";
import Navbar from "@/components/Navbar";
import RoomWindow from "@/components/RoomWindow";
const RoomSettingWindow = dynamic(() => import("@/components/RoomSettingWindow"));
const CallStartedModal = dynamic(() => import("@/components/CallStartedModal"));
const NewChatModal = dynamic(() => import("@/components/NewChatModal"));

const getUserRooms = async (
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
	})) as unknown as PageResponse<RoomDto>;
};

export default function Home() {
	const { token, userProfile } = useContext(AuthenticationContext);
	const [refresh, setRefresh] = useLocalStorage<boolean>("refresh", false);
	const [activeRoom, setActiveRoom] = useState<string | null>(null);
	const [page, setPage] = useState<number>(0);
	const roomsData = useSWRMutation(`${config.cloud.uri}/api/room/user`, getUserRooms);
	const [rooms, setRooms] = useState<RoomDto[]>(() => roomsData.data?.data || []);
	const roomData = useSWR(
		[`${config.cloud.uri}/api/room/${activeRoom}`, token, setRefresh],
		fetcher
	);
	const roomInfo: RoomDto = roomData.data?.data;
	const [newChatModal, setNewChatModal] = useState<boolean>(false);
	const [callStartModal, setCallStartModal] = useState<boolean>(false);
	const [roomSetting, setRoomSetting] = useState<boolean>(false);
	const [userCalled, setUserCalled] = useState<string>("");
	const router = useRouter();
	useEffect(() => {
		if (token === "" && !userProfile) {
			router.push("/login");
		}
	}, [token, userProfile]);

	useEffect(() => {
		roomsData.trigger({ token, page, pageSize: 20 });
	}, [page]);

	useEffect(() => {
		if (roomsData.error) {
			setRefresh(true);
		} else {
			if (page === 0) {
				if (roomsData.data?.data) {
					setRooms(roomsData.data?.data);
				}
			} else {
				setRooms((old) => {
					if (!roomsData.data?.data) return old;
					return [...old, ...roomsData.data?.data];
				});
			}
		}
	}, [roomsData.data]);

	const handleActiveRoom = (newActiveRoom: string) => {
		setActiveRoom(newActiveRoom);
	};

	const handleRoomSetting = (s: boolean) => {
		setRoomSetting(s);
	};

	const handleCallStartModal = (s: boolean, user: string) => {
		setCallStartModal(s);
		setUserCalled(user);
	};

	return (
		<>
			{newChatModal && (
				<NewChatModal
					open={newChatModal}
					setOpen={setNewChatModal}
					handleActiveRoom={handleActiveRoom}
				/>
			)}

			{callStartModal && (
				<CallStartedModal
					open={callStartModal}
					setOpen={setCallStartModal}
					userCalled={userCalled}
					chatRoom={roomInfo}
				/>
			)}
			<Navbar handleActiveRoom={handleActiveRoom} />
			<DashboardBar
				roomInfo={roomInfo}
				setNewChatModal={setNewChatModal}
				setRoomSetting={setRoomSetting}
			/>
			<div className="flex min-h-[87%] max-h-[89%]" id="messages">
				<RoomWindow
					rooms={rooms}
					setPage={setPage}
					activeRoom={activeRoom}
					handleActiveRoom={handleActiveRoom}
				/>
				<ChatWindow roomInfo={roomInfo} handleCallStartModal={handleCallStartModal} />
				{roomSetting && (
					<RoomSettingWindow
						roomInfo={roomInfo}
						handleActiveRoom={handleActiveRoom}
						handleRoomSetting={handleRoomSetting}
						mutate={() => {
							roomData.mutate();
							roomsData.trigger({ token, page, pageSize: 20 });
						}}
					/>
				)}
			</div>
		</>
	);
}
