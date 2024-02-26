import { clientsDB } from '../models/client';
import { gamesDB } from '../models/game';
import { getRoomByUserName, roomsDB } from '../models/room';
import { User, getWinners, getUserByName } from '../models/user';
import { gameFinish } from './gameController';
import { send } from './msgSender';
import { UserFront, wsAPI } from '../types';
import { generateID, stringifyData } from '../utils';

export const userRegister = (data: UserFront , id: number) => {
	let user = getUserByName(data.name);
	if (user) {
		if(!user.validPass(data.password)) {
			console.log('user exists, wrong pass');
			user.error = true;
			user.errorText = 'User already exists, wrong password';
		} else {
			user.removeErr();
		}
	} else {
		user =  new User({...data});
		const index = generateID();
		user.register(index);
	}	
	//send register response
	send(stringifyData(wsAPI.reg, user.getDBInterface()), [id]);
	//send winners table on login
	send(stringifyData(wsAPI.updateWinners, getWinners()));
	//send rooms list
	send(stringifyData(wsAPI.updateRoom, roomsDB));

	return user;
}

export const userLeave = (id: number) => {
	const user = clientsDB.get(id).user;
	if (user) {
		//check if user had a room -> delete room 
		const room = getRoomByUserName(user.name);
		if (room){
			room.delete();
			send(stringifyData(wsAPI.updateRoom, roomsDB));
		}

		// check if user was in a game -> finish game, opponent wins
		const game = gamesDB.find(game => game.unorderedIds.includes(id));

		if (game) {
			const [id1, id2]  = game.unorderedIds;
			const winnerId = id1 === id ? id2 : id1;		
			userWins(winnerId);
			game.winPlayer = winnerId;
			gameFinish(game);
		}
		clientsDB.delete(id);
	}
}

export const userWins = (id: number) => {
	const user = clientsDB.get(id).user;
	user.wins++;
	//send winners table for all users
	send(stringifyData(wsAPI.updateWinners, getWinners()));
}