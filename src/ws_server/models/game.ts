import { ATTACK_STATUSES, Cell, GameDB, GameFront, Position, Ship } from '../types';
import { enemyHasShips, fontLog, generatePosition, getAffectedCells, isPartOfAliveShip } from '../utils';

export let gamesDB = [];
export const FIELD_SIZE = 10;

export interface Game extends GameDB { }
export class Game {
	constructor (gameId: number, [id1, id2]: Array<number>) {
		this.gameId = gameId;
		this.player1 = {
			currentPlayerIndex: id1,
		}
		this.player2 = {
			currentPlayerIndex: id2,
		}
		this.isFirstTurn = false;
	}

	create = () => {
		gamesDB.push(this);
	}

	addFirstPlayer: (data: GameFront) => void = ({ships, indexPlayer}) => {
		this.player1 = {
			currentPlayerIndex: indexPlayer,
			ships: ships,
		};
		this.field1 = setShips(ships);
	}

	addSecondPlayer: (data: GameFront) => void = ({indexPlayer, ships}) => {
		this.player2 = {
			currentPlayerIndex: indexPlayer,
			ships: ships,
		};
		
		this.field2 = setShips(ships);
		this.turnIndex = indexPlayer;
	}

	toggleTurn = () => {
		this.isFirstTurn = !this.isFirstTurn;
		this.turnIndex = this.isFirstTurn ? this.player1.currentPlayerIndex : this.player2.currentPlayerIndex ;
	}

	randomAttack: () => Position =  () => {
		let position: Position;
		const enemy = this.isFirstTurn ? this.field2 : this.field1;
		let cell = enemy[0][0];
		let i = 1;
		do {
			i++;
			// try 10 times
			if (i < 10) {
				position = generatePosition();
				let {x, y} = position;
				cell = enemy[y][x];
			// then pick first available for shoot cell
			} else {
				const search = Cell.empty || Cell.ship;
				const row = enemy.findIndex(r => r.includes(search));
				const i = enemy[row].findIndex(c => c == search);
				position = {
					y: row,
					x: i,
				}
				break;
			}

		} while (!(cell === Cell.empty || cell === Cell.ship));

		return position;
	}

	handleAttack: (position: Position) => [ res: string, empty: Set<Position>, killed: Set<Position>] = ({y, x}) => {
		let status = '';
		const enemy = this.isFirstTurn ? this.field2 : this.field1;
		const cell: Cell = enemy[y][x];
		// a set of empty cells, when any ship is killed
		let emptyNeighbors: Set<Position> = new Set();
		let killedShip: Set<Position> = new Set();


		switch (cell) {
			case Cell.empty:
				status = ATTACK_STATUSES.miss;
				enemy[y][x] = Cell.miss;
				break;
			case Cell.ship:
				enemy[y][x] = Cell.shot;
				if (isPartOfAliveShip(y, x, enemy)){
					status = ATTACK_STATUSES.shot;
				} else {
					status = ATTACK_STATUSES.killed;
					[emptyNeighbors, killedShip] = getAffectedCells(y, x, enemy);

					if (!enemyHasShips(enemy)) {
						this.winPlayer = this.isFirstTurn ? this.player1.currentPlayerIndex : this.player2.currentPlayerIndex;
					}
				}
				break;
			
			case Cell.dead:
			case Cell.shot:
			case Cell.miss:
				console.log(fontLog.FgRed, 'You have already tried this cell, choose another one');
				status = ATTACK_STATUSES.err;
				break;
			} 
			return [status, emptyNeighbors, killedShip];
	}

	getPlayersIds: () => Array<number> = () => {
		const id1 = this.player1.currentPlayerIndex;
		const id2 = this.player2.currentPlayerIndex;
		return [id1, id2];
	}

	delete = () => {
		gamesDB = gamesDB.filter(g => g.gameId !== this.gameId);
	}
}

export const getGameById: (id: number) => Game = (gameId) => gamesDB.find(game => game.gameId === gameId);

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