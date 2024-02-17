import { GameDB, GameFront } from '../types';

export const gamesDB = [];

export interface Game extends GameDB { }
export class Game {
	create = ({gameId, indexPlayer, ships}: GameFront) => {
		this.gameId = gameId;
		this.player1 = {
			currentPlayerIndex: indexPlayer,
			ships: ships,
		}
		gamesDB.push(this);
	}

	addOpponent = (data: GameFront) => {
		this.player2 = {
			currentPlayerIndex: data.indexPlayer,
			ships: data.ships
		}
	}
}

export const gameExists = (id: number) =>  gamesDB.find(game => game.gameId === id);

export const getGameById = (gameId: number) => gamesDB.find(room => room.gameId === gameId);