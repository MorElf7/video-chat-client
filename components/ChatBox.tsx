"use client";

import defaultPic from "@/public/avatar-default.png";
import Image from "next/image";
import { useState } from "react";
import { ChatDto } from "../interfaces/IRoom";
import { UserDto } from "../interfaces/IUser";
import { calendarTime } from "../utils/timeConverter";

export default function ({ chat, userProfile }: { chat: ChatDto; userProfile: UserDto }) {
	const [click, setClick] = useState(false);
	const handleClick = () => {
		setClick(!click);
	};

	if (userProfile?.id === chat?.user) {
		return (
			<div>
				<div className="flex justify-end mt-4">
					<div
						className="mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-3xl rounded-br-3xl text-white "
						onClick={handleClick}>
						{chat.message}
					</div>
					<Image
						src={userProfile?.avatar || defaultPic}
						className="object-cover h-8 w-8 rounded-full"
						alt=""
						width={256}
						height={256}
					/>
				</div>
				{click && (
					<div className="flex justify-end mb-1 text-zinc-400 text-sm mx-2">
						{calendarTime(chat.createdAt)}{" "}
					</div>
				)}
			</div>
		);
	} else {
		return (
			<div>
				<div className="flex justify-start mt-4">
					<Image
						src={userProfile?.avatar || defaultPic}
						className="object-cover h-8 w-8 rounded-full"
						alt=""
						width={256}
						height={256}
					/>
					<div
						className="ml-2 py-3 px-4 bg-gray-600 rounded-bl-3xl rounded-tl-3xl rounded-tr-3xl rounded-br-3xl text-white"
						onClick={handleClick}>
						{chat.message}
					</div>
				</div>

				{click && (
					<div className="flex justify-start mb-1 text-zinc-400 text-sm mx-2">
						{calendarTime(chat.createdAt)}{" "}
					</div>
				)}
			</div>
		);
	}
}
