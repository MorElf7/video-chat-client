"use client";

import defaultPic from "@/public/avatar-default.png";
import Image from "next/image";
import { RoomDto } from "../interfaces/IRoom";
import { timeFromNow } from "../utils/timeConverter";

export default function ({
	room,
	handleActiveRoom,
	classState,
}: {
	room: RoomDto;
	handleActiveRoom: (newActiveRoom: string) => void;
	classState: string;
}) {
	const chat = room.chats[0];
	const truncateMessage =
		chat?.message.length > 25 ? `${chat?.message.slice(0, 25)}...` : chat?.message;
	return (
		<button
			className={`flex flex-row py-4 pl-2 justify-center items-center border-b-2 border-gray-500 hover:bg-gray-500 ${classState}`}
			onClick={() => {
				handleActiveRoom(room.id);
			}}>
			<div className="w-[15%]">
				<Image
					src={room?.avatar || defaultPic}
					className="object-cover h-12 w-12 rounded-full"
					alt="Room Picture"
					width={256}
					height={256}
				/>
			</div>
			<div className="grow flex flex-col items-start mr-3">
				<div className="text-lg font-semibold">{room.name}</div>
				<div>
					<span className="text-gray-700 text-sm text-start">{truncateMessage}</span>
					<span className="text-gray-600 text-sm text-end">
						{` - ${timeFromNow(chat?.createdAt || room?.createdAt)}`}{" "}
					</span>
				</div>
			</div>
		</button>
	);
}
