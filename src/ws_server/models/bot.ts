import { shipsSets } from '../const/botShips';
import { wsAPI } from '../types';
import { generateID, getRandomInt, stringifyData } from '../utils';
import { Room } from './room';
import { User, usersDB } from './user';

export interface Bot extends User { }
export class Bot {
	user: User;
	room: Room;	
	id: number;

	constructor (user: User) {
		this.id = generateID();
		this.name = 'bot-'+this.id;
		this.index = this.id;
		this.user = user;
		this.isBot = true;
	}

	start = () => {
		usersDB.push(this);
		this.room = new Room(this, this.id);
		this.room.create();

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