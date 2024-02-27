import { clientsDB } from '../models/client';
import { Room, getRoomById, getRoomByUserName, roomsDB } from '../models/room';
import { User } from '../models/user';
import { wsAPI } from '../types';
import { stringifyData, fontLog } from '../utils';
import { gameCreate } from './gameController';
import { send } from './msgSender';

export const roomCreate = (user: User, id: number) => {
	let room = getRoomByUserName(user.name);
	if (!room) {
		room = new Room(user, id);
		room.create();
		// send to all clients about a new room 
		send(stringifyData(wsAPI.updateRoom, roomsDB));
	} else {
		console.log(fontLog.FgRed, 'This user already has one room')
	}
}

// 2 players in a room -> create_game
export const roomJoin = (roomId: number, id: number) => {
	const room = getRoomById(roomId);
	const user = clientsDB.get(id).user;

	if (!room.isMyOwn(user.name)) {
		const user = clientsDB.get(id).user;
		room.addUser(user, id);
		room.ids.push(id);
		gameCreate(room);
		roomDelete(room);
	} else {
		console.log(fontLog.FgRed, 'This is your room, try to find a real opponent');
	}
}

export const roomDelete = (room: Room) => {
	room.delete();
	send(stringifyData(wsAPI.updateRoom, roomsDB));
}