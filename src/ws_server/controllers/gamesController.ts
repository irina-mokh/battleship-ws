import { ATTACK_STATUSES, AttackFront, Cell, GameDB, GameFront, Position, Ship } from '../types';
import { generatePosition, getEmptyNeighbors, isPartOfAliveShip } from '../utils';

export const gamesDB = [];
export const FIELD_SIZE = 10;

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
		this.turnIndex = data.indexPlayer;
		this.isFirstTurn = false;
	}

	toggleTurn = () => {
		this.isFirstTurn = !this.isFirstTurn;
		this.turnIndex = this.isFirstTurn ? this.player1.currentPlayerIndex : this.player2.currentPlayerIndex ;
	}

	randomAttack: () => Position = () => {
		let position = generatePosition();
		let {x, y} = position;
		const enemy = this.isFirstTurn ? this.field2 : this.field1;

		while (enemy[y][x] == Cell.miss || enemy[y][x] == Cell.dead ||  enemy[y][x] == Cell.shot) {
			position = generatePosition();
		}
		return position;
	}

	handleAttack: (position: Position) => [ res: string, empty: Set<Position>] = ({y, x}) => {
		let status = '';
		const enemy = this.isFirstTurn ? this.field2 : this.field1;
		const cell: Cell = enemy[y][x];
		// a set of empty cells, when any ship is killed
		let emptyNeighbors: Set<Position> = new Set();

		if (cell === Cell.empty) {
			status = ATTACK_STATUSES.miss;
			enemy[y][x] = Cell.miss;
		} else {
			enemy[y][x] = Cell.shot;
			if (isPartOfAliveShip(y, x, enemy)){
				status = ATTACK_STATUSES.shot;
			} else {
				status = ATTACK_STATUSES.killed;
				emptyNeighbors = getEmptyNeighbors(y, x, enemy);
			}
		}
		
		return [status, emptyNeighbors];
	}
}

export const gameExists : (id: number) => boolean = (id) =>  gamesDB.find(game => game.gameId === id);

export const getGameById: (id: number) => Game = (gameId) => gamesDB.find(room => room.gameId === gameId);

const setShips = (ships: Array<Ship>) => {
	const field: Array<Array<Cell>> = new Array(FIELD_SIZE).fill('0').map(() => new Array(FIELD_SIZE).fill('-'));

	ships.forEach((ship: Ship) => {
		const { position, direction, length} = ship;
		const { x,y } = position;

		for ( let i = 0; i < length; i++) {
			if (direction) {
				field[y + i][x] = Cell.ship
			} else {
				field[y][x + i] = Cell.ship
			}
		}
	})

	return field;
}