"use client";

import defaultPic from "@/public/avatar-default.png";
import Image from "next/image";
import { useContext } from "react";
import useSWR from "swr";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { NotificationDto } from "../interfaces/INotification";
import { AuthenticationContext } from "@/components/AuthenticationProvider";
import { config } from "../utils/config";
import { fetcher } from "../utils/fetcher";
import { UserDto } from "../interfaces/IUser";
import client from "../utils/axiosClient";
import { DataResponse } from "../interfaces/IResponse";

export default function ({ notification, handleNotifications }: { notification: NotificationDto, handleNotifications: (s: string) => void }) {
	const { token } = useContext(AuthenticationContext);
	const [refresh, setRefresh] = useLocalStorage<boolean>("refresh", false);
	const userData = useSWR(
		[`${config.cloud.uri}/api/user/${notification?.user}`, token, setRefresh],
		fetcher
	);
  const userInfo: UserDto = userData.data?.data;

  const handleOnClick = async (e: any) => {
    e.preventDefault();
    const res = await client.post(`${config.cloud.uri}/api/notification/${notification?.id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }) as unknown as DataResponse<NotificationDto>
    if (res?.data) {
      handleNotifications(notification?.room.id)
    }
  }

	return (
		<div onClick={handleOnClick} className="flex w-full rounded-lg my-2 bg-white hover:bg-gray-400 hover:rounded-lg h-[60px]">
			<div className="mx-3 ">
				<Image
					src={userInfo?.avatar || notification?.room?.avatar || defaultPic}
					className="object-cover h-10 w-10 rounded-full mt-3"
					alt="Room Picture"
					width={256}
					height={256}
				/>
			</div>
			<div className="mx-3 py-1 flex-col">
				<div className="">{notification?.room?.name}</div>
				<div><span className="font-medium text-black">{userInfo?.username}</span> sends <span className="text-gray-500">{notification?.chat?.message}</span></div>
			</div>
		</div>
	);
}
