import { SetStateAction,  useContext, useEffect, } from "react";
import useSWR from "swr";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { RoomDto } from "../interfaces/IRoom";
import { AuthenticationContext } from "@/components/AuthenticationProvider";
import { config } from "../utils/config";
import { fetcher } from "../utils/fetcher";
import { useRouter } from "next/navigation";

export default function ({
	open,
	setOpen,
	userCalled,
	chatRoom
}: {
	open: boolean;
	setOpen: (newState: SetStateAction<boolean>) => void;
	userCalled: string;
	chatRoom: RoomDto
}) {
	const { token } = useContext(AuthenticationContext);
	const [refresh, setRefresh] = useLocalStorage<boolean>("refresh", false);
	const { data, mutate } = useSWR(
		[`${config.cloud.uri}/api/user/${userCalled}`, token, setRefresh],
		fetcher
	);
	const userInfo = data?.data;
	const router = useRouter();

	useEffect(() => {
		mutate();
	}, [userCalled]);

	return open ? (
		<div
			className="transition-all ease-in-out relative z-10"
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="false">
			<div className="fixed inset-0 z-10 overflow-y-auto overscroll-contain max-h-1/2 max-w-1/2">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<div
						className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ease-in-out"
						onClick={() => {
							setOpen(false);
						}}></div>
					<div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all ease-in-out sm:my-8 sm:w-full sm:max-w-lg">
						<div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
							<div className="">
								<div className="mx-auto flex h-10 w-full flex-shrink-0 items-start justify-center rounded-full ">
									<svg
										fill="none"
										stroke="currentColor"
										strokeWidth={1.5}
										viewBox="0 0 24 24"
										className="h-6 w-6"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden="true">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
										/>
									</svg>
									<h3
										className="mx-1 text-base font-semibold leading-6 text-gray-900"
										id="modal-title">
										{`${userInfo?.username} called you`} 
									</h3>
								</div>
								<div className=" text-center h-full"></div>
							</div>
						</div>
						<div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
							<button 
								type="button" onClick={() => {
									router.push(`/call/${chatRoom?.callRoom}`)
								}}
								className="inline-flex w-full justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 sm:ml-3 sm:w-auto">
								Accept
							</button>
							<button
								type="button"
								onClick={() => {
									setOpen(false);
								}}
								className="mt-3 inline-flex w-full justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-700 sm:mt-0 sm:w-auto">
								Decline
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	) : (
		<></>
	);
}
