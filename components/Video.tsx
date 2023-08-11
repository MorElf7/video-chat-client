"use client";

import React, { VideoHTMLAttributes, useEffect, useRef, useState } from "react";

type VideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
	username: string;
	stream: MediaStream;
	muted?: boolean;
	hasAudio: boolean;
	hasVideo: boolean;
};

const Video = ({ username, stream, muted, hasAudio, hasVideo, ...props }: VideoProps) => {
	const ref = useRef<HTMLVideoElement>(null);
	const [isMuted, setIsMuted] = useState<boolean>(false);

	useEffect(() => {
		if (ref.current) ref.current.srcObject = stream;
		if (muted) setIsMuted(muted);
	}, [stream, muted]);
	return (
		<div className=" relative w-60 h-[180px] m-[5px] ">
			<video
				className="absolute rounded-lg z-0 aspect-auto"
				ref={ref}
				muted={isMuted}
				autoPlay
				{...props}
			/>

			<div className="absolute z-10 left-0 bottom-0 p-[0.5px] text-white video-text">
				{username}
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
	);
};

export default Video;
