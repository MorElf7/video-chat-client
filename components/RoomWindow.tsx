"use client";

import { SetStateAction, useEffect } from "react";
import { RoomDto } from "../interfaces/IRoom";
import { reachBottom } from "../utils/scrollEventHandler";
import RoomBox from "./RoomBox";

export default function ({
	rooms, setPage,
	activeRoom,
	handleActiveRoom,
}: {
	rooms: RoomDto[],
	setPage: (S: SetStateAction<number>) => void,
	activeRoom: string | null;
	handleActiveRoom: (id: string) => void;
}) {

	useEffect(() => {
		setPage(0);
	}, [activeRoom]);

	useEffect(() => {
		if (!activeRoom) {
			handleActiveRoom(rooms?.[0]?.id);
		}
	}, [rooms]);

	return (
		<div
			className="flex flex-col overflow-y-auto overscroll-contain bg-slate-400 w-1/5 h-full"
			onScroll={(e) => {
				if (reachBottom(e)) {
					setPage((old) => old + 1);
				}
			}}>
			{rooms?.length > 0 &&
				rooms.map((room: RoomDto, i) => (
					<RoomBox
						room={room}
						key={i}
						handleActiveRoom={handleActiveRoom}
						classState={room.id === activeRoom ? "bg-slate-300" : ""}
					/>
				))}
		</div>
	);
}
