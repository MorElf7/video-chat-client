export interface LoginRequest {
	username: string;
	password: string;
}

export interface SignUpRequest {
	username: string;
	password: string;
	firstName: string;
	lastName: string;
}

export interface LoginResponse {
	token: string;
	refreshToken: string;
}

export interface GetAccessTokenRequest {
	token: string;
}
