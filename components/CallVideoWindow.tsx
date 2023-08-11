"use client"

import { AuthenticationContext } from "@/components/AuthenticationProvider";
import { DataResponse } from "@/interfaces/IResponse";
import { UserDto, WebRTCUser } from "@/interfaces/IUser";
import client from "@/utils/axiosClient";
import { config } from "@/utils/config";
import { setUpSocket } from "@/utils/socket";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import Video from "./Video";

export default function ({
	roomId,
	audioConfig,
	videoConfig,
}: {
	roomId: string;
	audioConfig: boolean;
	videoConfig: boolean;
}) {
	const [users, setUsers] = useState<WebRTCUser[]>([]);
	const localStreamRef = useRef<MediaStream>();
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const isAlreadyCallingRef = useRef<{ [socketId: string]: boolean }>({});
	const peerConnectionsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
	const localTrackRef = useRef<{
		[socketId: string]: { audio: RTCRtpSender; video: RTCRtpSender };
	}>({});
	const socketRef = useRef<Socket>();
	const { userProfile, token } = useContext(AuthenticationContext);
	const [hasVideo, setHasVideo] = useState<boolean>(videoConfig);
	const [hasAudio, setHasAudio] = useState<boolean>(audioConfig);
	const router = useRouter();

	useEffect(() => {
		if (token === "" && !userProfile) {
			router.push("/login");
		}
	}, []);

	const createPeerConnection = async (
		socketId: string,
		userId: string,
		audio: boolean,
		video: boolean
	) => {
		const pc = new RTCPeerConnection(config.pcConfig);

		pc.onicecandidate = (e) => {
			if (e.candidate) {
				socketRef.current?.emit("make-candidate", {
					label: e.candidate.sdpMLineIndex,
					candidate: e.candidate.candidate,
					to: socketId,
				});
			}
		};

		const userInfo = (await client.get(`${config.cloud.uri}/api/user/${userId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})) as DataResponse<UserDto>;
		pc.ontrack = (e) => {
			setUsers((oldUsers) =>
				oldUsers
					.filter((user) => user.id !== socketId)
					.concat({
						id: socketId,
						userId,
						username: userInfo.data?.username,
						video,
						audio,
						stream: e.streams[0],
					})
			);
		};

		localTrackRef.current[socketId] = {} as any;
		if (localStreamRef.current) {
			localStreamRef.current.getTracks().forEach((track) => {
				if (!localStreamRef.current) return;
				if (track.kind === "audio")
					localTrackRef.current[socketId].audio = pc.addTrack(track, localStreamRef.current);
				else if (track.kind === "video")
					localTrackRef.current[socketId].video = pc.addTrack(track, localStreamRef.current);
			});
		}

		return pc;
	};

	const connectPeer = useCallback(
		async (socketId: string, userId: string, audio: boolean, video: boolean) => {
			if (!peerConnectionsRef.current[socketId]) {
				peerConnectionsRef.current[socketId] = await createPeerConnection(
					socketId,
					userId,
					audio,
					video
				);
			}

			const offer = await peerConnectionsRef.current[socketId].createOffer();
			await peerConnectionsRef.current[socketId].setLocalDescription(
				new RTCSessionDescription(offer)
			);

			socketRef.current?.emit("make-offer", {
				offer,
				to: socketId,
				video: videoConfig,
				audio: audioConfig,
			});
		},
		[]
	);

	useEffect(() => {
		if (token !== "") {
			socketRef.current = setUpSocket(token);

			navigator.mediaDevices
				.getUserMedia({
					audio: true,
					video: true,
				})
				.then((stream) => {
					stream.getTracks().forEach((track) => {
						if (track.kind === "audio") track.enabled = audioConfig;
						if (track.kind === "video") track.enabled = videoConfig;
					});
					localStreamRef.current = stream;
					if (localVideoRef.current) localVideoRef.current.srcObject = stream;
					socketRef.current?.emit("subscribe", {
						roomId: roomId,
						type: "call",
					});
				})
				.catch((e) => console.warn(e));

			socketRef.current?.on(
				"offer-made",
				async (data: {
					offer: RTCSessionDescriptionInit;
					socket: string;
					user: string;
					audio: boolean;
					video: boolean;
				}) => {
					if (!isAlreadyCallingRef.current[data.socket]) {
						peerConnectionsRef.current[data.socket] = await createPeerConnection(
							data.socket,
							data.user,
							data.audio,
							data.video
						);
					}
					await peerConnectionsRef.current[data.socket].setRemoteDescription(
						new RTCSessionDescription(data.offer)
					);
					const answer = await peerConnectionsRef.current[data.socket].createAnswer();
					await peerConnectionsRef.current[data.socket].setLocalDescription(
						new RTCSessionDescription(answer)
					);

					socketRef.current?.emit("make-answer", {
						answer,
						to: data.socket,
					});
				}
			);

			socketRef.current?.on(
				"candidate-made",
				async (data: { label: number; candidate: string; socket: string }) => {
					const candidate = new RTCIceCandidate({
						sdpMLineIndex: data.label,
						candidate: data.candidate,
					});
					peerConnectionsRef.current[data.socket]?.addIceCandidate(candidate);
				}
			);

			socketRef.current?.on(
				"answer-made",
				async (data: { socket: string; answer: RTCSessionDescriptionInit }) => {
					await peerConnectionsRef.current[data.socket].setRemoteDescription(
						new RTCSessionDescription(data.answer)
					);
				}
			);

			socketRef.current?.on("left-call", async (data: { socket: string }) => {
				peerConnectionsRef.current[data.socket]?.close();
				delete peerConnectionsRef.current[data.socket];
				isAlreadyCallingRef.current[data.socket] = false;
				setUsers((oldUsers) => oldUsers.filter((user) => user.id !== data.socket));
			});

			socketRef.current?.on("user-disconnected", async (data: { socket: string }) => {
				peerConnectionsRef.current[data.socket]?.close();
				delete peerConnectionsRef.current[data.socket];
				isAlreadyCallingRef.current[data.socket] = false;
				setUsers((oldUsers) => oldUsers.filter((user) => user.id !== data.socket));
			});

			socketRef.current?.on(
				"new-user",
				async (data: {
					socket: string;
					user: string;
					type: string;
					video: boolean;
					audio: boolean;
				}) => {
					if (data.type === "call" && !isAlreadyCallingRef.current[data.socket]) {
						await connectPeer(data.socket, data.user, data.audio, data.video);
						isAlreadyCallingRef.current[data.socket] = true;
					}
				}
			);

			socketRef.current?.on(
				"new-mute-config",
				({ socket, video, audio }: { socket: string; audio: boolean; video: boolean }) => {
					setUsers((oldUsers) => {
						const user = oldUsers.find((e) => e.id === socket);
						if (!user) return oldUsers;
						return oldUsers
							.filter((e) => e.id !== socket)
							.concat({
								...user,
								audio,
								video,
							});
					});
				}
			);
		}
		return () => {
			socketRef.current?.emit("leave-call", {
				to: roomId,
			});
			socketRef.current?.disconnect();
			users.forEach((user) => {
				if (!peerConnectionsRef.current[user.id]) return;
				peerConnectionsRef.current[user.id].close();
				delete peerConnectionsRef.current[user.id];
			});
			localStreamRef.current?.getTracks().forEach((track) => {
				track.stop();
			});
		};
	}, [roomId, connectPeer]);

	useEffect(() => {
		if (localStreamRef.current) {
			const videoTrack = localStreamRef.current.getVideoTracks()[0],
				audioTrack = localStreamRef.current.getAudioTracks()[0];

			if (videoTrack) {
				videoTrack.enabled = hasVideo;
			}
			if (audioTrack) {
				audioTrack.enabled = hasAudio;
			}

			if (peerConnectionsRef.current) {
				for (const socketId of Object.keys(peerConnectionsRef.current)) {
					localTrackRef.current[socketId].audio.replaceTrack(audioTrack);
					localTrackRef.current[socketId].video.replaceTrack(videoTrack);
				}
			}
		}
		socketRef.current?.emit("mute-config", {
			to: roomId,
			audio: hasAudio,
			video: hasVideo,
		});
	}, [hasAudio, hasVideo]);

	const handleLeaveCall = () => {
		socketRef.current?.emit("leave-call", { to: roomId });
		router.push("/");
	};

	const handleMuteVideo = () => {
		setHasVideo(!hasVideo);
	};

	const handleMuteAudio = () => {
		setHasAudio(!hasAudio);
	};

	return (
		<div className="flex flex-col grow shrink mt-[25px] ml-[60px] w-3/4 max-h-[900px]">
			<div className="grow">
				<div className="p-3 gap-4 overflow-y-auto overscroll-contain grow shrink inline-flex flex-wrap w-full">
					{userProfile && (
						<div className=" relative w-60 h-[180px] m-[5px] ">
							<video
								className="absolute rounded-lg z-0 aspect-auto"
								ref={localVideoRef}
								muted
								autoPlay
							/>

							<div className="absolute z-10 left-0 bottom-0 p-[0.5px] text-white video-text">
								{`${userProfile?.username} (Me)`}
							</div>
							<div className="absolute z-10 right-0 bottom-0 flex">
								{!hasVideo && (
									<svg
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6 stroke-red-500 video-text"
										aria-hidden="true">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"></path>
									</svg>
								)}
								{!hasAudio && (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6 stroke-red-500 video-text"
										fill="none"
										strokeWidth={1.5}
										viewBox="0 0 24 24"
										stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M19 19L17.591 17.591L5.409 5.409L4 4"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 18.75C13.5913 18.75 15.1174 18.1179 16.2426 16.9926C17.3679 15.8674 18 14.3413 18 12.75V11.25M12 18.75C10.4087 18.75 8.88258 18.1179 7.75736 16.9926C6.63214 15.8674 6 14.3413 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C11.2044 15.75 10.4413 15.4339 9.87868 14.8713C9.31607 14.3087 9 13.5456 9 12.75V4.5C9 3.70435 9.31607 2.94129 9.87868 2.37868C10.4413 1.81607 11.2044 1.5 12 1.5C12.7956 1.5 13.5587 1.81607 14.1213 2.37868C14.6839 2.94129 15 3.70435 15 4.5V12.75C15 13.5456 14.6839 14.3087 14.1213 14.8713C13.5587 15.4339 12.7956 15.75 12 15.75Z"
										/>
									</svg>
								)}
							</div>
						</div>
					)}

					{users.map((user, index) => (
						<Video
							key={index}
							username={user.username}
							stream={user.stream}
							hasAudio={user.audio}
							hasVideo={user.video}
						/>
					))}
				</div>
			</div>
			<div className="h-[70px] mb-[5px] flex justify-center">
				<div className="bg-zinc-300 rounded-full flex py-5 px-8 items-center gap-x-5">
					<button type="button" onClick={handleMuteVideo}>
						{!hasVideo ? (
							<svg
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								className="h-9 w-9 stroke-slate-500 hover:stroke-zinc-800"
								aria-hidden="true">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"></path>
							</svg>
						) : (
							<svg
								fill="none"
								stroke="currentColor"
								strokeWidth={1.5}
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								className="h-9 w-9 stroke-slate-500 hover:stroke-zinc-800"
								aria-hidden="true">
								<path
									strokeLinecap="round"
									d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
								/>
							</svg>
						)}
					</button>
					<button
						type="button"
						className="bg-red-500 hover:bg-red-800 rounded-full p-3 "
						onClick={handleLeaveCall}>
						<svg
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							className="h-8 w-8 stroke-white "
							aria-hidden="true">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0l6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z"></path>
						</svg>
					</button>
					<button type="button" onClick={handleMuteAudio}>
						{!hasAudio ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-9 w-9 stroke-slate-500 hover:stroke-zinc-800"
								fill="none"
								strokeWidth={1.5}
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M19 19L17.591 17.591L5.409 5.409L4 4"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 18.75C13.5913 18.75 15.1174 18.1179 16.2426 16.9926C17.3679 15.8674 18 14.3413 18 12.75V11.25M12 18.75C10.4087 18.75 8.88258 18.1179 7.75736 16.9926C6.63214 15.8674 6 14.3413 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C11.2044 15.75 10.4413 15.4339 9.87868 14.8713C9.31607 14.3087 9 13.5456 9 12.75V4.5C9 3.70435 9.31607 2.94129 9.87868 2.37868C10.4413 1.81607 11.2044 1.5 12 1.5C12.7956 1.5 13.5587 1.81607 14.1213 2.37868C14.6839 2.94129 15 3.70435 15 4.5V12.75C15 13.5456 14.6839 14.3087 14.1213 14.8713C13.5587 15.4339 12.7956 15.75 12 15.75Z"
								/>
							</svg>
						) : (
							<svg
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-9 w-9 stroke-slate-500 hover:stroke-zinc-800"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"></path>
							</svg>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
