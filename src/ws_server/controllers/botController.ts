import { shipsSets } from '../bot/botShips';
import { wsAPI } from '../types';
import { fontLog, generateID, getRandomInt, stringifyData } from '../utils';
import { Room, roomsDB } from './roomsController';
import { User, usersDB } from './usersController';
import { EventEmitter } from 'events';

export interface Bot extends User { }
export class Bot {
	user: User;
	room: Room;	

	constructor (user: User) {
		const id = generateID();
		this.name = 'bot-'+id;
		this.index = id;
		this.user = user;
		this.isBot = true;
	}

	start = () => {
		usersDB.push(this);
		this.room = new Room(this);
		this.room.create();
		console.log(fontLog.BgGray, roomsDB);

		// console.log('Bot gameId = roomId', this.room.roomId);
		return stringifyData(wsAPI.joinRoom, {indexRoom: this.room.roomId});
	}

	addShips = () => {
		const set = getRandomInt(shipsSets.length);
		return stringifyData(wsAPI.addShips, { 
			ships: shipsSets[set],
			gameId: this.room.roomId,
			indexPlayer: this.index,
		});
	}

	attack = () => stringifyData(wsAPI.randomAttack, {
		gameId: this.room.roomId,
		indexPlayer: this.index,
	})
		
}