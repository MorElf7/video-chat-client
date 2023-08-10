const config = {
	cloud: {
		uri: process.env.NEXT_PUBLIC_CLOUD_URI || "http://localhost:8082",
	},
	pcConfig : {
		iceServers: [
			// {
			// 	urls: "turn:turn.anyfirewall.com:443?transport=tcp",
			// 	credential: "webrtc",
			// 	username: "webrtc",
			// },
			{
				urls: "stun:stun.l.google.com:19302",
			},
		],
	}
};

export { config };
