import { RoomDB, UserDB } from '../types';

export let roomsDB = [];

export class Room {
	roomId: number;
	roomUsers: Array<Partial<UserDB>>;

	constructor ({index, name}) {
		this.roomUsers = [{ index, name }];
		this.roomId = +new Date();
	}

	exists = (creatorName: string) =>  roomsDB.find(room => room.roomUsers.find(user => user.name === creatorName));

	create = () => {
		roomsDB.push(this);
	}

	addUser = (client: Partial<UserDB>) => {
		this.roomUsers.push(client);
	}

	delete = () => {
		roomsDB = roomsDB.filter(r => r.roomId !== this.roomId);
	}

}

export const getRoomById = (roomId: number) => roomsDB.find(room => room.roomId === roomId);