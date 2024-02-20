import { ATTACK_STATUSES, UserFront, wsAPI, wsMsg, Position } from '../types';
import { fontLog, generateID, stringifyData } from '../utils';
import { User, getWinners, userExists } from './usersController';
import { IncomingMessage } from 'http';
import { wss } from '..';
import { Room, getRoomById, roomExists, roomsDB } from './roomsController';
import { Game, gameExists, getGameById } from './gamesController';

const CLIENTS = {};
let id1: number;
let id2: number;

let game: Game;

export const handleWS = (ws: WebSocket, req: IncomingMessage) => {
	const id = generateID();
	CLIENTS[id] = ws;

	let curUser: User;

	const broadcast = (msg: string, ids = []) => {
		console.log(fontLog.BgCyan, '->> Broadcast msg:', msg);
		if (ids.length) {
			console.log(fontLog.BgYellow, "CLIENTS: ", ids);
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

	const handleAttack: (position: Position) => void = ({y, x}) => {
		if (game.turnIndex === curUser.index) {
			const [status, emptyCells, killedShip] = game.handleAttack({y, x});

			if (status !== ATTACK_STATUSES.err) {
				broadcast((stringifyData(wsAPI.attack, {
					status,
					currentPlayer: curUser.index,
					position: {x, y}

				})), [id1, id2]);

				if (status === ATTACK_STATUSES.miss) {
					game.toggleTurn();
					
				} else {
					// send miss for all empty cells around
					if (emptyCells.size > 0) {
						emptyCells.forEach(cell => {
							broadcast((stringifyData(wsAPI.attack, {
								status: 'miss',
								currentPlayer: curUser.index,
								position: {...cell}
			
							})), [id1, id2]);
						})
					}

					// send 'killed' for all ship cells
					if (killedShip.size > 0) {
						killedShip.forEach(cell => {
							broadcast((stringifyData(wsAPI.attack, {
								status: ATTACK_STATUSES.killed,
								currentPlayer: curUser.index,
								position: {...cell}
			
							})), [id1, id2]);
						})
					}

					if (game.winPlayer) {
						// finish game for 2 players
						broadcast(stringifyData(wsAPI.finish, {
							winPlayer: game.winPlayer
						}), [id1, id2]);
						// add win
						curUser.wins++;
						//broadcast winners table for all users
						broadcast(stringifyData(wsAPI.updateWinners, getWinners()));
					}
				}

				//send turn after every valid attack
				broadcast(stringifyData(wsAPI.turn, {
					currentPlayer: game.turnIndex,
				}), [id1, id2]);
			}
		}
	}

	ws.onerror = () => console.error;
	
	ws.onmessage = (msg: {data: string}) => { 
		const request: wsMsg = JSON.parse(msg.data);
		const { type } = request;

		const data =  request.data && JSON.parse(request.data); 
		console.log(fontLog.FgCyan, 'Received data: ', data)
		
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
				curUser = user;
				broadcast(stringifyData(wsAPI.reg, user.getDBInterface()), [curUser.index]);

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
					
					const [user1, user2] = [...targetRoom.roomUsers];

					broadcast(stringifyData(wsAPI.createGame, {
						idGame: targetRoom.roomId,
						idPlayer: user1.index,
					}), [user1.index]);
					broadcast(stringifyData(wsAPI.createGame, {
						idGame: targetRoom.roomId,
						idPlayer: user2.index,
					}), [user2.index]);

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

					const {player1, player2, turnIndex} = game;
					id1 = player1.currentPlayerIndex;
					id2 = player2.currentPlayerIndex;

					// start game for each user
					broadcast(stringifyData(wsAPI.startGame, player1), [id1]);
					broadcast(stringifyData(wsAPI.startGame, player2), [id2]);
					// send turn for both
					broadcast(stringifyData(wsAPI.turn, {
						currentPlayer: turnIndex,
					}), [id1, id2]);

				} else {
					game = new Game();
					game.create(data);
				}
				break;

			case wsAPI.randomAttack:
				const position = game.randomAttack();
				handleAttack(position);
				break;

			case wsAPI.attack:
				const {x, y} = data;
				handleAttack({y, x})
				break;
		}
	};
}

