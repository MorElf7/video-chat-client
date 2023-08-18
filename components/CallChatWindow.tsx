"use client";

import { AuthenticationContext } from "@/components/AuthenticationProvider";
import ChatBox from "@/components/ChatBox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ChatDto, RoomDto } from "@/interfaces/IRoom";
import { config } from "@/utils/config";
import { fetcher } from "@/utils/fetcher";
import { reachBottomReverse } from "@/utils/scrollEventHandler";
import { setUpSocket } from "@/utils/socket";
import { useContext, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import useSWR from "swr";

export default function ({ roomId }: { roomId: string | null }) {
	const { token, userProfile } = useContext(AuthenticationContext);
	const [refresh, setRefresh] = useLocalStorage<boolean>("refresh", false);
	const [page, setPage] = useState<number>(0);
	const [chats, setChats] = useState<ChatDto[]>([]);
	const [message, setMessage] = useState<string>("");
	const socketRef = useRef<Socket>();
	const roomData = useSWR(
		[`${config.cloud.uri}/api/room/${roomId}`, token, setRefresh, null],
		fetcher
	);
	const roomInfo: RoomDto = roomData.data?.data;
	const chatsData = useSWR(
		[
			`${config.cloud.uri}/api/room/${roomId}/chat`,
			token,
			setRefresh,
			{
				page,
				pageSize: 20,
			},
		],
		fetcher
	);

	useEffect(() => {
		if (token !== "") {
			socketRef.current = setUpSocket(token);

			socketRef.current.on("message-sent", ({ chat }: { chat: ChatDto }) => {
				setChats((old) => [chat, ...old]);
			});

			socketRef.current.emit("subscribe", {
				roomId: roomId,
				type: "chat",
			});
		}

		return () => {
			socketRef.current?.disconnect();
		};
	}, []);

	useEffect(() => {
		chatsData.mutate();
	}, [page]);

	useEffect(() => {
		if (chatsData.data?.data) {
			if (page === 0) {
				setChats(chatsData.data.data);
			} else {
				setChats((old) => [...old, ...chatsData.data?.data]);
			}
		}
	}, [chatsData.data]);

	const handleSendMessage = () => {
		if (message === "") return;
		if (roomId) {
			socketRef.current?.emit("send-message", {
				to: roomId,
				message,
			});
			setMessage("");
		}
	};

	return (
		<div className="flex grow flex-col-reverse w-1/4 bg-slate-500 mr-14 mt-8 mb-8 rounded-lg ">
			<div className="flex flex-row-reverse items-center bg-zinc-600 h-[8%] rounded-b-lg w-full pl-5 pr-3 py-5 ">
				<svg
					onClick={handleSendMessage}
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="1.5"
					stroke="currentColor"
					color="white"
					className="w-9 h-9 stroke-slate-200 hover:stroke-zinc-700 mr-4">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
					/>
				</svg>
				<input
					onChange={(e) => {
						setMessage(e.target.value);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSendMessage();
						}
					}}
					type="text"
					name="message"
					id="message"
					value={message}
					className="bg-gray-300 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-white focus:border-white block w-full mr-3 ml-2 p-3 "
					placeholder="Text Message"
				/>
			</div>
			<div
				className="overflow-auto overscroll-contain flex grow shrink flex-col-reverse px-5 py-5 min-h-[780px] max-h-[790px]"
				onScroll={(e) => {
					if (reachBottomReverse(e)) {
						setPage((old) => old + 1);
					}
				}}>
				{chats.length > 0 &&
					chats.map((chat: ChatDto, index) => (
						<ChatBox chat={chat} userProfile={userProfile} key={index} />
					))}
			</div>
			<div className="flex grow bg-zinc-600 rounded-t-lg h-[40px] p-3 items-center text-white">
				{roomInfo?.name}
			</div>
		</div>
	);
}
