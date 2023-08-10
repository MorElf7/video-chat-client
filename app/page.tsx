"use client";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { act } from "react-dom/test-utils";
import useSWR from "swr";
import CallStartModaledModal from "./components/CallStartedModal";
import ChatWindow from "./components/ChatWindow";
import DashboardBar from "./components/DashboardBar";
import Navbar from "./components/Navbar";
import NewChatModal from "./components/NewChatModal";
import RoomSettingWindow from "./components/RoomSettingWindow";
import RoomWindow from "./components/RoomWindow";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { RoomDto } from "./interfaces/IRoom";
import { UserDto } from "./interfaces/IUser";
import { AuthenticationContext } from "./layout";
import { config } from "./utils/config";
import { fetcher } from "./utils/fetcher";

export default function Home() {
	const [refresh, setRefresh] = useLocalStorage<boolean>("refresh", false);
	const [activeRoom, setActiveRoom] = useState<string | null>(null);
	const [newChatModal, setNewChatModal] = useState<boolean>(false);
	const [callStartModal, setCallStartModal] = useState<boolean>(false);
	const [roomSetting, setRoomSetting] = useState<boolean>(false);
	const router = useRouter();
	const { token, userProfile } = useContext(AuthenticationContext);
	const [page, setPage] = useState<number>(0);
	const [userCalled, setUserCalled] = useState<string>("");

	const roomsData = useSWR(
		[`${config.cloud.uri}/api/room/user`, token, setRefresh, { page, pageSize: 20, type: "chat" }],
		fetcher
	);
	const [rooms, setRooms] = useState<RoomDto[]>([]);
	const roomData = useSWR(
		[`${config.cloud.uri}/api/room/${activeRoom}`, token, setRefresh],
		fetcher
	);
	const roomInfo: RoomDto = roomData.data?.data;

	useEffect(() => {
		if (token === "" && !userProfile) {
			router.push("/login");
		}
	}, [token, userProfile]);

	useEffect(() => {
		roomsData.mutate();
	}, [activeRoom]);

	useEffect(() => {
		roomsData.mutate();
	}, [page]);

	useEffect(() => {
		if (roomsData.data?.data) {
			if (page === 0) {
				setRooms(roomsData.data?.data);
			} else {
				setRooms((old) => [...old, ...roomsData.data?.data]);
			}
		}
	}, [roomsData.data]);

	const handleActiveRoom = useCallback((newActiveRoom: string) => {
		setActiveRoom(newActiveRoom);
	}, []);

	const handleRoomSetting = useCallback((s: boolean) => {
		setRoomSetting(s);
	}, []);

	const handleCallStartModal = useCallback((s: boolean, user: string) => {
		setCallStartModal(s);
		setUserCalled(user);
	}, []);

	return (
		<div className="flex flex-col h-screen ">
			<NewChatModal
				open={newChatModal}
				setOpen={setNewChatModal}
				handleActiveRoom={handleActiveRoom}
			/>
			<CallStartModaledModal
				open={callStartModal}
				setOpen={setCallStartModal}
				userCalled={userCalled}
				chatRoom={roomInfo}
			/>
			<Navbar handleActiveRoom={handleActiveRoom}/>
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
							roomsData.mutate();
						}}
					/>
				)}
			</div>
		</div>
	);
}
