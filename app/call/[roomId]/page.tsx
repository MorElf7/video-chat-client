"use client";

import ChatWindow from "./ChatWindow";
import VideoWindow from "./VideoWindow";
import { AuthenticationContext } from "@/app/layout";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect } from "react";

export default function Call({ params }: { params: { roomId: string } }) {
	const roomId = params.roomId;
	const searchParams = useSearchParams();
	const audioConfig = searchParams.get("audio") === "true" ? true : false;
	const videoConfig = searchParams.get("video") === "true" ? true : false;
	const router = useRouter();
	const { userProfile, token } = useContext(AuthenticationContext);

	useEffect(() => {
		if (token === "" && !userProfile) {
			router.push("/login");
		}
	}, []);

	return (
		<div className="flex flex-row h-screen w-screen grow shrink">
			<VideoWindow roomId={roomId} audioConfig={audioConfig} videoConfig={videoConfig} />
			<ChatWindow roomId={roomId} />
		</div>
	);
}
