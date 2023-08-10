"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import useSWR from "swr";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ChatDto, RoomDto } from "../interfaces/IRoom";
import { AuthenticationContext } from "../layout";
import { config } from "../utils/config";
import { fetcher } from "../utils/fetcher";
import { reachBottomReverse } from "../utils/scrollEventHandler";
import { setUpSocket } from "../utils/socket";
import ChatBox from "./ChatBox";

export default function ({ roomInfo }: { roomInfo: RoomDto }) {
	const [page, setPage] = useState<number>(0);
	const [chats, setChats] = useState<ChatDto[]>([]);
	const [refresh, setRefresh] = useLocalStorage<boolean>("refresh", false);
	const [message, setMessage] = useState<string>("");
	const { token, userProfile } = useContext(AuthenticationContext);
	const socketRef = useRef<Socket>();

	const chatsData = useSWR(
		[
			`${config.cloud.uri}/api/room/${roomInfo?.id}/chat`,
			token,
			setRefresh,
			{ page, pageSize: 20, type: "chat" },
		],
		fetcher
	);

	useEffect(() => {
		if (token !== "") {
			socketRef.current = setUpSocket(token);

			socketRef.current.on("message-sent", ({ chat }: { chat: ChatDto }) => {
				setChats((old) => [chat, ...old]);
			});

			if (roomInfo?.id) {
				socketRef.current.emit("subscribe", {
					roomId: roomInfo.id,
					type: "chat",
				});
			}
		}

		return () => {
			socketRef.current?.disconnect();
		};
	}, [roomInfo]);
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
		socketRef.current?.emit("send-message", {
			to: roomInfo?.id,
			message,
		});
		setMessage("");
	};
	return (
		<div className="flex flex-col-reverse grow ">
			<div className="flex flex-row-reverse h-[8%] pl-5 pr-3 pt-5 mb-3 items-center">
				<svg
					onClick={handleSendMessage}
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="1.5"
					stroke="currentColor"
					color="white"
					className="w-8 h-8 hover:stroke-slate-400">
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
					className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-white focus:border-white block w-full mr-3 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
					placeholder="Text Message"
				/>
			</div>

			<div
				className="overflow-auto overscroll-contain flex grow shrink flex-col-reverse px-5 py-5 "
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
		</div>
	);
}
