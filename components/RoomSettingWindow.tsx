"use client";

import Image from "next/image";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DataResponse } from "../interfaces/IResponse";
import { RoomDto, SaveRoomRequest } from "../interfaces/IRoom";
import { AuthenticationContext } from "@/components/AuthenticationProvider";
import client from "../utils/axiosClient";
import { config } from "../utils/config";

const initalPayload = {
	id: "",
	users: [],
	type: "",
	chats: [],
	avatar: "",
	name: "",
	callRoom: "",
	description: "",
} as SaveRoomRequest;

export default function ({
	roomInfo,
	handleActiveRoom,
	handleRoomSetting,
	mutate,
}: {
	roomInfo: RoomDto;
	handleActiveRoom: (s: string) => void;
	handleRoomSetting: (s: boolean) => void;
	mutate: () => void;
}) {
	const [payload, setPayload] = useState<SaveRoomRequest>(initalPayload);
	const { token } = useContext(AuthenticationContext);
	const [dragActive, setDragActive] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleChange = useCallback((e: any) => {
		setPayload((old: SaveRoomRequest) => {
			return { ...old, [e.target.name]: e.target.value };
		});
	}, []);


	const handleDrag = (e: any) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: any) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			const FR = new FileReader();
			FR.readAsDataURL(e.dataTransfer.files[0]);
			FR.onload = () => {
				setPayload((old: SaveRoomRequest) => {
					if (!FR.result) return old;
					return { ...old, avatar: FR.result.toString() };
				});
			};
		}
	};

	const onButtonClick = () => {
		inputRef.current?.click();
	};

	useEffect(() => {
		if (roomInfo) setPayload(roomInfo);
	}, [roomInfo]);

	const handleAvatarChange = (e: any) => {
		if (!e.target.files || !e.target.files[0]) return;
		const FR = new FileReader();
		FR.readAsDataURL(e.target.files[0]);
		FR.onload = () => {
			setPayload((old: SaveRoomRequest) => {
				if (!FR.result) return old;
				return { ...old, avatar: FR.result.toString() };
			});
		};
	};

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		const res = (await client.post(`${config.cloud.uri}/api/room`, payload, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})) as unknown as DataResponse<RoomDto>;
		if (res.data) {
			handleActiveRoom(res.data.id);
			handleRoomSetting(false);
			mutate();
		}
	};

	return (
		<div className="flex flex-col w-1/4 bg-slate-400 overflow-y-auto overscroll-contain">
			<form action="#" className="space-y-6 p-5">
				<div className="flex">
					<svg
						fill="none"
						stroke="currentColor"
						strokeWidth={1.5}
						className="h-7 w-7 mr-3"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					<h3 className="text-xl font-medium text-gray-900">Room Setting</h3>
				</div>

				<div>
					<label htmlFor="name" className="text-sm font-medium text-gray-900 block mb-2 ">
						Room name
					</label>
					<input
						type="text"
						name="name"
						id="name"
						className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
						placeholder="Room name"
						required={true}
						onChange={handleChange}
						value={payload.name}
					/>
				</div>
				<div className="mb-8" 
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}>
					<label className="text-sm font-medium text-gray-900 block mb-2" htmlFor="avatar">
						Avatar
					</label>
					<input
						type="file"
						ref={inputRef}
						name="avatar"
						id="avatar"
						className="sr-only"
						onChange={handleAvatarChange}
					/>
					<label
						htmlFor="avatar"
						className="relative flex min-h-[200px] max-h-[400px] items-center justify-center rounded-md border border-dashed border-[#e0e0e0] p-4 text-center">
						<div>
							{payload.avatar !== "" && (
								<Image
									src={payload.avatar}
									alt="Avatar"
									width={260}
									height={260}
									className="h-[300px] w-[300px] pt-6"
								/>
							)}
							<span className="mb-2 block text-xl font-semibold text-[#07074D]">
								Drop files here
							</span>
							<span className="mb-2 block text-base font-medium text-gray-300">Or</span>
							<span className="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-[#07074D] mb-6">
								Browse
							</span>
						</div>
					</label>
				</div>
				<div>
					<label htmlFor="description" className="text-sm font-medium text-gray-900 block mb-2 ">
						Description
					</label>
					<textarea
						rows={3}
						wrap="soft"
						name="description"
						id="description"
						placeholder="Description"
						className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
						onChange={handleChange}
						value={payload.description}
					/>
				</div>
				<button
					type="submit"
					className="w-full text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
					onClick={handleSubmit}>
					Save changes
				</button>
			</form>
		</div>
	);
}
