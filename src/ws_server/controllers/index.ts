import { ATTACK_STATUSES, UserFront, wsAPI, wsMsg, Position, BotApi } from '../types';
import { fontLog, generateID, stringifyData } from '../utils';
import { User, getUserById, getWinners, userExists } from './usersController';
import { wss } from '..';
import { Room, getRoomById, roomExists, roomsDB } from './roomsController';
import { Game, gameExists, getGameById } from './gamesController';
import { WebSocketServer } from 'ws';
import { handleBot } from '../bot/botHandlder';

const CLIENTS = {};


export const handleWS = (ws: WebSocketServer) => {
	let curUser: User;
	const id = generateID();
	let singlePlay = false;
	CLIENTS[id] = ws;

	const broadcast = (msg: string, ids = []) => {
		console.log(fontLog.BgCyan, '->> Send:', msg);
		if (ids.length) {
			console.log(fontLog.BgCyan, "To clients: ", ids);
			ids.forEach(id => {
				const targetClient = CLIENTS[id];
				if (targetClient) {
					targetClient.send(msg);
				}
			})
		} else {
			wss.clients.forEach((client) => {
				client.send(msg);
			});
		}
	};

	const handleAttack: (position: Position, game: Game, attacking: number) => void = ({y, x}, game, attackingId) => {
		const user = getUserById(attackingId);
		const [id1, id2] = game.getPlayersIds();

		if (game.turnIndex === attackingId) {
			console.log(fontLog.BgGreen, 'handleAttack');
			console.log(fontLog.BgGreen, attackingId);

			const [status, emptyCells, killedShip] = game.handleAttack({y, x});

			if (status !== ATTACK_STATUSES.err) {
				broadcast((stringifyData(wsAPI.attack, {
					status,
					currentPlayer: attackingId,
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
								currentPlayer: attackingId,
								position: {...cell}
			
							})), [id1, id2]);
						})
					}

					// send 'killed' for all ship cells
					if (killedShip.size > 0) {
						killedShip.forEach(cell => {
							broadcast((stringifyData(wsAPI.attack, {
								status: ATTACK_STATUSES.killed,
								currentPlayer: attackingId,
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
						if (!singlePlay){
							user.wins++;
							//broadcast winners table for all users
							broadcast(stringifyData(wsAPI.updateWinners, getWinners()));
						}
					}
				}

				//send turn after every valid attack
				broadcast(stringifyData(wsAPI.turn, {
					currentPlayer: game.turnIndex,
				}), [id1, id2]);
			}
		}
		if (singlePlay && game.turnIndex === id1) {
			ws.emit(BotApi.attack);
		}
	}
	handleBot(ws, curUser);

	ws.on('message', async (msg) => { 
		// curUser = getUserById(id);

		const request: wsMsg = JSON.parse(msg);
		let { type } = request;
		const data =  request.data && JSON.parse(request.data); 
		console.log(fontLog.BgMagenta, type);
		console.log(fontLog.FgCyan, 'Received data: ', data);
		
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
				broadcast(stringifyData(wsAPI.reg, user.getDBInterface()), [id]);

				//broadcast winners table on login
				broadcast(stringifyData(wsAPI.updateWinners, getWinners()));
				//broadcast rooms list
				broadcast(stringifyData(wsAPI.updateRoom, roomsDB));
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
					const [id1, id2] = game.getPlayersIds();

					// start game for each user
					broadcast(stringifyData(wsAPI.startGame, player1), [id1]);
					broadcast(stringifyData(wsAPI.startGame, player2), [id2]);
					// send turn for both
					broadcast(stringifyData(wsAPI.turn, {
						currentPlayer: turnIndex,
					}), [id1, id2]);

				} else {
					const game = new Game();
					game.create(data);
				}
				break;

			case wsAPI.randomAttack:
				const randomAttackGame = getGameById(data.gameId);
				const position = await randomAttackGame.randomAttack();
				handleAttack(position, randomAttackGame, data.indexPlayer);
				break;

			case wsAPI.attack:
				const {x, y} = data;
				handleAttack({y, x}, getGameById(data.gameId), data.indexPlayer)
				break;

			case wsAPI.singlePlay:
				console.log(fontLog.BgWhite, 'cur user', curUser);

				ws.emit(BotApi.start);
				singlePlay = true;
				break;
		}
	});

	
};

