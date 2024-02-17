import { RoomDB, UserDB } from '../types';

export let roomsDB = [];

export interface Room extends RoomDB { }
export class Room {

	constructor ({index, name}) {
		this.roomUsers = [{ index, name }];
		this.roomId = +new Date();
	}

	create = () => {
		roomsDB.push(this);
	}

	isMyOwn = (client: Partial<UserDB>) => this.roomUsers.find(user => user.index === client.index)

	addUser = (client: Partial<UserDB>) => {
		this.roomUsers.push(client);
	}

	delete = () => {
		roomsDB = roomsDB.filter(r => r.roomId !== this.roomId);
	}

}

export const roomExists = (creatorName: string) =>  roomsDB.find(room => room.roomUsers.find((user: UserDB) => user.name === creatorName));

export const getRoomById = (roomId: number): Room => roomsDB.find(room => room.roomId === roomId);