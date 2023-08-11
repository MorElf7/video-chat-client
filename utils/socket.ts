import io from "socket.io-client";
import { config } from "./config";

export const setUpSocket = (token: string) => {
	const socket = io(`${config.cloud.uri}/socket`, {
		auth: {
			token,
		},
	});
	return socket;
};
