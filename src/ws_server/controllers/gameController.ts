import { Game, getGameById } from '../models/game';
import { ATTACK_STATUSES, wsAPI, BotApi, AttackFront, GameFront } from '../types';
import { stringifyData } from '../utils';
import { send } from './msgSender';
import { userWins } from './userController';
import { Room } from '../models/room';
import { clientsDB } from '../models/client';

export const gameCreate = (room: Room, id: number) => {
	const {roomId, ids} = room;
	const [id1, id2] = ids;

	const game = new Game(roomId, ids);
	game.create();

	// send to room users - create_game
	send(stringifyData(wsAPI.createGame, {
			idGame: roomId,
			idPlayer: id1,
	}), [id1]);
	send(stringifyData(wsAPI.createGame, {
		idGame: roomId,
		idPlayer: id2,
	}), [id2]);
}

export const gameStart = (game: Game, id: number) => {
	const {player1, player2, turnIndex } = game;
	const [id1, id2] = game.getPlayersIds();
	// start game for each user
	send(stringifyData(wsAPI.startGame, player1), [id1]);
	send(stringifyData(wsAPI.startGame, player2), [id2]);
	// send turn for both
	send(stringifyData(wsAPI.turn, {
		currentPlayer: turnIndex,
	}), [id1, id2]);
}

// 2 players added ships -> start_game
export const gameAddShips = (data: GameFront) => {

	const id = data.indexPlayer;
	let game = getGameById(data.gameId);

	const [gameId1, gameId2] = game.getPlayersIds();
	let id1: number, id2: number;
	let sameOrder = id === gameId1;

	id1 = sameOrder ? gameId1 : gameId2;
	id2 = sameOrder ? gameId2 : gameId1;

	if(!game.field1) {
		game.addFirstPlayer(data);
	} else {
		game.addSecondPlayer(data);
		gameStart(game, data.indexPlayer);
	}
}

export const handleAttack: (data: AttackFront, id: number) => void = ({x, y, indexPlayer, gameId}, id) => {
	const game = getGameById(gameId)
	const [id1, id2] = game.getPlayersIds();
	const {singlePlay, ws} = clientsDB.get(id);


	if (game.turnIndex === indexPlayer) {
		// console.log(fontLog.BgGreen, 'handleAttack');
		// console.log(fontLog.BgGreen, indexPlayer);

		const [status, emptyCells, killedShip] = game.handleAttack({y, x});

		if (status !== ATTACK_STATUSES.err) {
			send((stringifyData(wsAPI.attack, {
				status,
				currentPlayer: indexPlayer,
				position: {x, y}

			})), [id1, id2]);

			if (status === ATTACK_STATUSES.miss) {
				game.toggleTurn();
			} else {
				// send miss for all empty cells around
				if (emptyCells.size > 0) {
					emptyCells.forEach(cell => {
						send((stringifyData(wsAPI.attack, {
							status: 'miss',
							currentPlayer: indexPlayer,
							position: {...cell}
		
						})), [id1, id2]);
					})
				}

				// send 'killed' for all ship cells
				if (killedShip.size > 0) {
					killedShip.forEach(cell => {
						send((stringifyData(wsAPI.attack, {
							status: ATTACK_STATUSES.killed,
							currentPlayer: indexPlayer,
							position: {...cell}
		
						})), [id1, id2]);
					})
				}
				
				if (game.winPlayer) {
					gameFinish(game);
					// add win
					if (!clientsDB.get(id).singlePlay){
						userWins(indexPlayer);
					}
				}
			}

			//send turn after every valid attack
			send(stringifyData(wsAPI.turn, {
				currentPlayer: game.turnIndex,
			}), [id1, id2]);
		}
	}
	if (singlePlay && game.turnIndex === id1) {
		ws.emit(BotApi.attack);
	}
}

export const gameFinish = (game: Game) => {
	const [id1, id2] = game.getPlayersIds();
	game.delete();
	// finish game for 2 players
	send(stringifyData(wsAPI.finish, {
		winPlayer: game.winPlayer
	}), [id1, id2]);
}