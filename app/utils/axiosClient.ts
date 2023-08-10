import axios from "axios";
import https from "https";
import { config } from "./config";

const client = axios.create({
	baseURL: config.cloud.uri,
	headers: {
		"Content-Type": "application/json",
	},
	httpsAgent: new https.Agent({
		rejectUnauthorized: false,
	}),
});

client.interceptors.request.use(
	function (config) {
		return config;
	},
	function (error) {
		return Promise.reject(error);
	}
);

client.interceptors.response.use(
	function (response) {
		return response.data;
	},
	function (error) {
		return Promise.reject(error.response);
	}
);

export default client;
