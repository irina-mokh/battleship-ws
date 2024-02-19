import { GameDB, GameFront, Ship } from '../types';

export const gamesDB = [];
const FIELD_SIZE = 10;
export interface Game extends GameDB { }
export class Game {
	create = ({gameId, indexPlayer, ships}: GameFront) => {
		this.gameId = gameId;
		this.player1 = {
			currentPlayerIndex: indexPlayer,
			ships: ships,
		}
		this.field1 = setShips(ships),
		gamesDB.push(this);
	}

	addOpponent = (data: GameFront) => {
		this.player2 = {
			currentPlayerIndex: data.indexPlayer,
			ships: data.ships,
		};
		this.field2 = setShips(data.ships);
	}
}

export const gameExists = (id: number) =>  gamesDB.find(game => game.gameId === id);

export const getGameById = (gameId: number) => gamesDB.find(room => room.gameId === gameId);

const setShips = (ships: Array<Ship>) => {
	const field = new Array(FIELD_SIZE).fill('0').map(() => new Array(FIELD_SIZE).fill('-'));

	ships.forEach((ship: Ship) => {
		const { position, direction, length} = ship;
		const { x,y } = position;

		for ( let i = 0; i < length; i++) {
			if (direction) {
				field[y + i][x] = '+'
			} else {
				field[y][x + i] = '+'
			}
		}
	})

	// console.log(field);
	return field;
}