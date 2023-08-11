import { ChatDto, RoomDto } from "./IRoom";

export interface NotificationDto {
	id: string;
	chat: ChatDto;
	user: string;
	room: RoomDto;
	isRead: boolean;
	updatedAt: Date;
	createdAt: Date;
}
