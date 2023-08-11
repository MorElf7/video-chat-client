"use client"

import ChatWindow from "@/components/CallChatWindow";
import VideoWindow from "@/components/CallVideoWindow";
import { useSearchParams } from "next/navigation";

export default function Call({ params }: { params: { roomId: string } }) {
	const roomId = params.roomId;
	const searchParams = useSearchParams();
	const audioConfig = searchParams.get("audio") === "true" ? true : false;
	const videoConfig = searchParams.get("video") === "true" ? true : false;

	return (
		<div className="flex flex-row h-screen w-screen grow shrink">
			<VideoWindow roomId={roomId} audioConfig={audioConfig} videoConfig={videoConfig} />
			<ChatWindow roomId={roomId} />
		</div>
	);
}
