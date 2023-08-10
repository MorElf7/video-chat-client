const config = {
	cloud: {
		uri: process.env.NEXT_PUBLIC_CLOUD_URI || "http://localhost:8082",
	},
	pcConfig: {
		iceServers: [
			{
				urls: "stun:stun.relay.metered.ca:80",
			},
			{
				urls: "turn:a.relay.metered.ca:80",
				username: "0334734087c1ba118c083d26",
				credential: "ejYxn2f7II5TQFLQ",
			},
			{
				urls: "turn:a.relay.metered.ca:80?transport=tcp",
				username: "0334734087c1ba118c083d26",
				credential: "ejYxn2f7II5TQFLQ",
			},
			{
				urls: "turn:a.relay.metered.ca:443",
				username: "0334734087c1ba118c083d26",
				credential: "ejYxn2f7II5TQFLQ",
			},
			{
				urls: "turn:a.relay.metered.ca:443?transport=tcp",
				username: "0334734087c1ba118c083d26",
				credential: "ejYxn2f7II5TQFLQ",
			},
		],
	},
};

export { config };
