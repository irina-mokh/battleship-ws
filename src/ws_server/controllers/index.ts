import { RoomDB, UserDB, UserFront, wsAPI, wsMsg } from '../types';
import { fontLog, generateID, stringifyData } from '../utils';
import { User, getWinners, userExists, usersDB } from './usersController';
import { IncomingMessage } from 'http';
import { wss } from '..';
import { Room, getRoomById, roomExists, roomsDB } from './roomsController';
import { Game, gameExists, gamesDB, getGameById } from './gamesController';

const CLIENTS = {};
export const handleWS = (ws: WebSocket, req: IncomingMessage) => {
	const id = generateID();
	CLIENTS[id] = ws;

	let curUser: UserDB;

	const broadcast = (msg: string, ids = []) => {
		console.log(fontLog.FgCyan, '->> Broadcast:', msg);
		if (ids.length) {
			console.log(ids);
			ids.forEach(id => {
				const targetClient = CLIENTS[id];
				targetClient.send(msg);
			})
		} else {
			wss.clients.forEach((client) => {
				client.send(msg);
			});
		}
	};

	ws.onerror = () => console.error;
	
	ws.onmessage = (msg: {data: string}) => { 
		const request: wsMsg = JSON.parse(msg.data);
		const { type } = request;

		const data =  request.data && JSON.parse(request.data); 
		
		switch (type) {
			case wsAPI.reg:
				const userInput: UserFront = data;
				let user = new User({...userInput});
				
				if (userExists(userInput.name) && !user.validPass()) {
					user.error = true;
					user.errorText = 'User already exists, wrong password';
				} else {
					user.register(id);
				}
				curUser = user.getDBInterface();
				ws.send(stringifyData(wsAPI.reg, curUser));

				//broadcast winners table on login
				broadcast(stringifyData(wsAPI.updateWinners, getWinners()));
				break;

			case wsAPI.createRoom:
				const room = new Room(curUser);
				if (!roomExists(curUser.name)) {
					room.create();
					// broadcast to all clients about new room creation
					broadcast(stringifyData(wsAPI.updateRoom, roomsDB));
				} else {
					console.log(fontLog.FgRed, 'This user already has one room')
				}
				break;

			// join somebody's room
			case wsAPI.joinRoom:
				const targetRoom = getRoomById(data.indexRoom);
				if (!targetRoom.isMyOwn(curUser)) {
					targetRoom.addUser(curUser);
					// broadcast for TWO users - game creation
					const roomUsersIds = targetRoom.roomUsers.map((u: UserDB)  => u.index);
					broadcast(stringifyData(wsAPI.createGame, {
						idGame: targetRoom.roomId,
						idPlayer: curUser.index,
					}), roomUsersIds);

					targetRoom.delete();
					// broadcast ALL: remove room from available
					broadcast(stringifyData(wsAPI.updateRoom, roomsDB));
				} else {
					console.log(fontLog.FgRed, 'This your room, try to find a real opponent');
				}
				break;	
			
			case wsAPI.addShips:
				if (gameExists(data.gameId)) {
					const game = getGameById(data.gameId);
					game.addOpponent(data);

					ws.send(stringifyData(wsAPI.startGame, curUser));

					// start game for each user
					broadcast(stringifyData(wsAPI.startGame, game.player1), [game.player1.currentPlayerIndex]);
					broadcast(stringifyData(wsAPI.startGame, game.player2), [game.player2.currentPlayerIndex]);
				} else {
					const game = new Game();
					game.create(data);
				}
				break;
		}
	};
}

