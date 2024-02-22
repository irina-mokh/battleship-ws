import { clientsDB } from '../models/client';
import { gamesDB } from '../models/game';
import { getRoomByUserName, roomsDB } from '../models/room';
import { User, getWinners, getUserByName, getUserByIndex } from '../models/user';
import { UserFront, wsAPI } from '../types';
import { generateID, stringifyData } from '../utils';
import { gameFinish } from './gameController';
import { send } from './msgSender';

export const userRegister = (data: UserFront , id: number) => {
	// let user = getUserById(id):
	let user = getUserByName(data.name);
	if (user) {
		if(!user.validPass()) {
			user.error = true;
			user.errorText = 'User already exists, wrong password';
		}
	}  else {
		user =  new User({...data});
		const index = generateID();
		user.register(index, id);
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
	const user = getUserByIndex(id);
	if (user) {
		//check if user had a room -> delete room 
		const room = getRoomByUserName(user.name);
		if (room){
			room.delete();
			send(stringifyData(wsAPI.updateRoom, roomsDB));
		}

		// check if user was in a game -> finish game, opponent wins
		console.log(gamesDB);
		const game = gamesDB.find(game => game.player1.currentPlayerIndex === user.index || game.player2.currentPlayerIndex === user.index);

		if (game) {
			const [id1, id2]  = game.getPlayersIds();
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