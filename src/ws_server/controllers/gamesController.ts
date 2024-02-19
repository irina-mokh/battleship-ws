import { ATTACK_STATUSES, AttackFront, Cell, GameDB, GameFront, Position, Ship } from '../types';
import { fontLog, generatePosition, getRandomInt } from '../utils';

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
		const cell: string = enemy[y][x];

		const shipParts: Set<string> = new Set();
		const emptyNeighbors: Set<Position> = new Set();

		const addCellIfShip = (y: number,  x: number) => {
			const curCell = enemy[y][x];
			const cellStr = [y, x, enemy[y][x]].join('-');

			//  save alive cells of ship
			if (curCell === Cell.ship) {
				shipParts.add(cellStr);
			}
			// save dead cell if absent
			if (curCell === Cell.shot)
				if (!shipParts.has(cellStr)) {
					shipParts.add(cellStr);
				 	isPartOfAliveShip(y, x);
				}
		}

		function isPartOfAliveShip(y: number, x: number) {
			// check only for directions
			if (y > 0) addCellIfShip(y - 1, x);
			if (x > 0) addCellIfShip(y, x - 1);
			if (y < FIELD_SIZE - 1) addCellIfShip(y + 1, x);
			if (x < FIELD_SIZE - 1) addCellIfShip(y, x + 1);

			let result = false;
			shipParts.forEach((cell) => {
				if(cell.endsWith(Cell.ship)) {
					result = true;
				}
			})

			return result;
		};

		const addCellIfEmpty = (y: number, x: number) => {
			const curCell = enemy[y][x];
			if (curCell === Cell.empty || curCell === Cell.miss) {
				emptyNeighbors.add({
					x, y
				})
			} else {
				if (curCell === Cell.shot) findEmptyNeighbors(y, x);
			}
		}

		function findEmptyNeighbors (y: number, x: number) {
			enemy[y][x] = Cell.dead;

			if (y > 0) {
				addCellIfEmpty(y - 1 , x);
				if (x > 0) addCellIfEmpty(y - 1, x - 1);
				if (x < FIELD_SIZE - 1) addCellIfEmpty(y - 1, x + 1);
			} 

			if (x > 0) addCellIfEmpty(y, x - 1);
			if (x < FIELD_SIZE - 1) addCellIfEmpty(y, x + 1);
			

			if ( y < FIELD_SIZE - 1 ) {
				addCellIfEmpty(y + 1, x);
				if (x > 0) addCellIfEmpty(y + 1, x - 1);
				if (x < FIELD_SIZE - 1) addCellIfEmpty(y + 1, x + 1);
			}
		}

		if (cell === Cell.empty) {
			status = ATTACK_STATUSES.miss;
			enemy[y][x] = Cell.miss;
		} else {
			enemy[y][x] = Cell.shot;
			if (isPartOfAliveShip(y, x)){
				status = ATTACK_STATUSES.shot;
			} else {
				status = ATTACK_STATUSES.killed;
				findEmptyNeighbors(y, x);
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