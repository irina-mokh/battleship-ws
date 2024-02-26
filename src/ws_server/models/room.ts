import { RoomDB, UserDB } from '../types';
import { generateID } from '../utils';
import { User } from './user';

export let roomsDB = [];
export interface Room extends RoomDB { }
export class Room {

	constructor (user: Partial<User>, id1: number) {
		this.roomUsers = [user];
		this.roomId = generateID();
		this.ids = [id1]
	}

	create = () => {
		roomsDB.push(this);
	}

	isMyOwn = (username: string) => this.roomUsers.find(user => user.name === username)

	addUser = (client: Partial<UserDB>, id: number) => {
		this.roomUsers.push(client);
		this.ids.push(id);
	}

	delete = () => {
		roomsDB = roomsDB.filter(r => r.roomId !== this.roomId);
	}

}

export const getRoomById: (id: number) => Room = (roomId) => roomsDB.find(room => room.roomId === roomId);

export const getRoomByUserName: (username: string) => Room | undefined = (username): Room => roomsDB.find(room => room.roomUsers.find((user: UserDB) => user.name === username));