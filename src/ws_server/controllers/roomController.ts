import { clientsDB } from '../models/client';
import { Room, getRoomById, getRoomByUserName, roomsDB } from '../models/room';
import { User, getUserByIndex } from '../models/user';
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
	// const user = getUserByIndex(id);
	const targetRoom = getRoomById(roomId);
	if (!targetRoom.isMyOwn(id)) {
		const user = clientsDB.get(id).user;
		targetRoom.addUser(user, id);
		targetRoom.ids.push(id);
		gameCreate(targetRoom, id);
		roomDelete(targetRoom);
	} else {
		console.log(fontLog.FgRed, 'This your room, try to find a real opponent');
	}
}

export const roomDelete = (room: Room) => {
	room.delete();
	// to everyone: remove room from available
	send(stringifyData(wsAPI.updateRoom, roomsDB));
}