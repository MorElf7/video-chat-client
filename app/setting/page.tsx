"use client";

import Image from "next/image";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { SaveUserRequest, UserDto } from "../interfaces/IUser";
import { AuthenticationContext } from "../layout";
import client from "../utils/axiosClient";
import { config } from "../utils/config";
import { DataResponse } from "../interfaces/IResponse";
import { useRouter } from "next/navigation";

const initalPayload = {
	id: "",
	username: "",
	firstName: "",
	lastName: "",
	password: "",
	newPassword: "",
	bio: "",
	avatar: "",
	email: "",
	phone: "",
};

export default function () {
	const { userProfile, token, mutate } = useContext(AuthenticationContext);
	const [changePassword, setChangePassword] = useState<boolean>(false);
	const [payload, setPayload] = useState<SaveUserRequest>(initalPayload);
	const [dragActive, setDragActive] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

	useEffect(() => {
		if (userProfile) {
			setPayload({
				...userProfile,
				password: "",
				newPassword: "",
			});
		}
	}, [userProfile]);

	const handleChange = useCallback((e: any) => {
		setPayload((old: SaveUserRequest) => {
			return { ...old, [e.target.name]: e.target.value };
		});
	}, []);

	const handleAvatarChange = (e: any) => {
		if (!e.target.files || !e.target.files[0]) return;
		const FR = new FileReader();
		FR.readAsDataURL(e.target.files[0]);
		FR.onload = () => {
			setPayload((old: SaveUserRequest) => {
				if (!FR.result) return old;
				return { ...old, avatar: FR.result.toString() };
			});
		};
	};

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
				setPayload((old: SaveUserRequest) => {
					if (!FR.result) return old;
					return { ...old, avatar: FR.result.toString() };
				});
			};
		}
	};

	const handleSubmit = async (e: any) => {
		e.preventDefault();
    const res = (await client.post(`${config.cloud.uri}/api/user`, payload, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})) as unknown as DataResponse<UserDto>;
		if (res.data) {
      mutate();
      router.push("/")
		} else {
      router.refresh();
    }
	};

	const onButtonClick = () => {
		inputRef.current?.click();
	};

	return (
		<div className="flex flex-row w-full max-h-[900px] justify-center">
			<form
				action="#"
				className="overflow-y-auto overscroll-contain space-y-6 p-5 w-4/5 bg-zinc-900 my-5 rounded-xl">
				<div className="flex">
					<svg
						fill="none"
						stroke="currentColor"
						strokeWidth={1.5}
						className="h-7 w-7 mr-3 stroke-white"
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
					<h3 className="text-xl font-medium text-gray-300">Profile Settings</h3>
				</div>
				<div className="flex w-full flex-row">
					<div className="flex flex-col w-[40%] mr-[15%]">
						<div className="w-full mr-5 mb-3">
							<label htmlFor="username" className="text-sm font-medium text-gray-300 block mb-2 ">
								Username
							</label>
							<input
								type="text"
								name="username"
								id="username"
								className="bg-gray-50 border border-gray-300 text-gray-300 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
								placeholder="Your Username"
								required={true}
								onChange={handleChange}
								value={payload.username}
							/>
						</div>
						<div className="w-full mr-5 mb-3">
							<label htmlFor="firstName" className="text-sm font-medium text-gray-300 block mb-2 ">
								First Name
							</label>
							<input
								type="text"
								name="firstName"
								id="firstName"
								className="bg-gray-50 border border-gray-300 text-gray-300 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
								placeholder="Your First Name"
								required={true}
								onChange={handleChange}
								value={payload.firstName}
							/>
						</div>
						<div className="w-full mr-5 mb-3">
							<label htmlFor="lastName" className="text-sm font-medium text-gray-300 block mb-2 ">
								Last Name
							</label>
							<input
								type="text"
								name="lastName"
								id="lastName"
								className="bg-gray-50 border border-gray-300 text-gray-300 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
								placeholder="Your Last Name"
								required={true}
								onChange={handleChange}
								value={payload.lastName}
							/>
						</div>
					</div>
					<div className="flex flex-col w-[40%]">
						<div className="">
							<button
								type="button"
								className="bg-white rounded-lg px-3 py-1 mb-3 hover:bg-gray-300"
								onClick={() => {
									setChangePassword((old) => !old);
								}}>
								Change Password
							</button>
						</div>
						{changePassword && (
							<>
								<div className="w-full mr-5 mb-3">
									<label
										htmlFor="password"
										className="text-sm font-medium text-gray-300 block mb-2 ">
										Current Password
									</label>
									<input
										type="password"
										name="password"
										id="password"
										className="bg-gray-50 border border-gray-300 text-gray-300 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
										placeholder="Your Current Password"
										required={true}
										onChange={handleChange}
										value={payload.password}
									/>
								</div>
								<div className="w-full mr-5 mb-3">
									<label
										htmlFor="newPassword"
										className="text-sm font-medium text-gray-300 block mb-2 ">
										New Password
									</label>
									<input
										type="password"
										name="newPassword"
										id="newPassword"
										className="bg-gray-50 border border-gray-300 text-gray-300 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
										placeholder="Your New Password"
										required={true}
										onChange={handleChange}
										value={payload.newPassword}
									/>
								</div>
							</>
						)}
					</div>
				</div>
				<div
					className="mb-8 w-[40%]"
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}>
					<label className="text-sm font-medium text-gray-300 block mb-2" htmlFor="avatar">
						Avatar
					</label>
					<input
						ref={inputRef}
						type="file"
						name="avatar"
						id="avatar"
						className="sr-only"
						onChange={handleAvatarChange}
					/>
					<label
						htmlFor="avatar"
						className="relative flex min-h-[200px] max-h-[400px] items-center justify-center rounded-md border border-dashed border-[#e0e0e0] p-4 text-center">
						<div>
							{payload?.avatar && payload.avatar !== "" && (
								<Image
									src={payload?.avatar}
									alt="Avatar"
									width={260}
									height={260}
									className="h-[300px] w-[400px] pt-6"
								/>
							)}
							<span className="mb-2 block text-xl font-semibold text-gray-300">
								Drop files here
							</span>
							<span className="mb-2 block text-base font-medium text-gray-300">Or</span>
							<button
								onClick={onButtonClick}
								className="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-gray-300 mb-6 hover:bg-gray-500">
								Browse
							</button>
						</div>
					</label>
				</div>
				<div>
					<label htmlFor="bio" className="text-sm font-medium text-gray-300 block mb-2 ">
						Bio
					</label>
					<textarea
						rows={3}
						wrap="soft"
						name="bio"
						id="bio"
						placeholder="Your bio"
						className="bg-gray-50 border border-gray-300 text-gray-300 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
						onChange={handleChange}
						value={payload.bio}
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
