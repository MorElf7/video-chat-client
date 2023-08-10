"use client";

import { DataResponse } from "@/app/interfaces/IResponse";
import { RoomDto } from "@/app/interfaces/IRoom";
import { AuthenticationContext } from "@/app/layout";
import client from "@/app/utils/axiosClient";
import { config } from "@/app/utils/config";
import defaultPic from "@/public/avatar-default.png";
import Image from "next/image";
import { useContext, useState } from "react";

export default function ({ room, handleMutate }: { room: RoomDto, handleMutate: () => void }) {
	const [moreDesc, setMoreDesc] = useState<boolean>(() => false);
	const { token, userProfile } = useContext(AuthenticationContext);
	const [isJoined, setIsJoined] = useState<boolean>(room?.users.includes(userProfile?.id));
	const truncateDesc =
		room?.description?.length > 350 ? `${room?.description.slice(0, 350)} ...` : room?.description;

	const handleJoinRoom = async () => {
		if (!isJoined) {
			const newRoom = {
				...room,
				users: room.users.concat(userProfile?.id),
			};
			const res = (await client.post(`${config.cloud.uri}/api/room`, newRoom, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})) as DataResponse<RoomDto>;
			setIsJoined(true);
			handleMutate();
		}
	};

	return (
		<div
			className={`flex bg-zinc-500  rounded-lg my-1  h-[${
				room?.description?.length > 350 ? room?.description?.length / 3 + 40 : 400
			}px] py-2`}>
			<div className="w-[10%] mr-9">
				<Image
					src={room?.avatar || defaultPic}
					className="object-cover h-[100px] w-[100px] rounded-full ml-4 "
					alt="Room Picture"
					width={256}
					height={256}
				/>
			</div>
			<div className="flex w-[80%] flex-col items-start mr-3 ml-5">
				<div className="text-lg font-semibold">{room?.name}</div>
				<div className="text-gray-800 text-sm text-start">
					{moreDesc ? room?.description : truncateDesc} <span> </span>
					{!moreDesc ? (
						<span
							className="hover:underline hover:underline-offset-2"
							onClick={() => {
								setMoreDesc(!moreDesc);
							}}>
							More
						</span>
					) : (
						<span
							className="hover:underline hover:underline-offset-2"
							onClick={() => {
								setMoreDesc(!moreDesc);
							}}>
							Less
						</span>
					)}
				</div>
			</div>
			<div className="w-[10%] flex items-center">
				{isJoined ? (
					<button className="bg-slate-400 rounded-full px-3 py-1 mr-4 text-white" disabled>
						Joined
					</button>
				) : (
					<button
						onClick={handleJoinRoom}
						className="bg-blue-500 rounded-full px-3 py-1 mr-4 text-zinc-300 hover:bg-blue-600">
						Join
					</button>
				)}
			</div>
		</div>
	);
}
