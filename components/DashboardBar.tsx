"use client";

import { useRouter } from "next/navigation";
import { SetStateAction } from "react";
import { RoomDto } from "../interfaces/IRoom";

export default function ({
	roomInfo,
	setNewChatModal,
	setRoomSetting,
}: {
	roomInfo: RoomDto;
	setNewChatModal: (s: SetStateAction<boolean>) => void;
	setRoomSetting: (s: SetStateAction<boolean>) => void;
}) {
	const router = useRouter();

	const handleStartVideoCall = async () => {
		if (roomInfo) {
			router.push(`/call/${roomInfo.id}?audio=true&video=true`);
		}
	};
	const handleStartAudioCall = () => {
		if (roomInfo) {
			router.push(`/call/${roomInfo.id}?audio=true`);
		}
	};
	return (
		<div className="flex h-[6%] bg-gray-600">
			<div className="flex flex-row-reverse w-1/5 pt-2 pr-2 border-r-[1px] border-slate-400">
				<button type="button">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
						onClick={() => {
							setNewChatModal((old) => !old);
						}}
						color="white"
						className="w-7 h-7 hover:stroke-slate-400 mb-2">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
						/>
					</svg>
				</button>
			</div>
			<div className="flex w-4/5 bg-gray-600 px-5 pt-4 border-slate-400">
				<div className=" text-white w-2/5">{roomInfo?.name}</div>
				<div className="flex w-3/5 flex-row-reverse pb-5">
					<button
						type="button"
						onClick={() => {
							setRoomSetting((old) => !old);
						}}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							stroke="currentColor"
							color="white"
							className="w-7 h-7 ml-3 hover:stroke-slate-400">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</button>

					<button type="button" onClick={handleStartVideoCall}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							color="white"
							stroke="currentColor"
							className="w-7 h-7 ml-3 hover:stroke-slate-400">
							<path
								strokeLinecap="round"
								d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
							/>
						</svg>
					</button>
					<button type="button" onClick={handleStartAudioCall}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							color="white"
							stroke="currentColor"
							className="w-7 h-7 ml-3 hover:stroke-slate-400">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
