import { FIELD_SIZE } from './controllers/gamesController';
import { Cell, Field, Position, wsAPI } from './types';

export const stringifyData = (type: wsAPI, data: unknown) => {

	return JSON.stringify({
		type: type,
		data: JSON.stringify(data),
		id: 0
	})
}

export const generateID = () => Number(String((new Date()).getTime()) + Math.floor((Math.random()*100)));

// only for one line! (with reset)
export const fontLog = {
	Reset : '\x1b[0m',
	Bright : '\x1b[1m' + '%s\x1b[0m',
	Dim : '\x1b[2m' + '%s\x1b[0m',
	Underscore : '\x1b[4m' + '%s\x1b[0m',
	Blink : '\x1b[5m' + '%s\x1b[0m',
	Reverse : '\x1b[7m' + '%s\x1b[0m',
	Hidden : '\x1b[8m' + '%s\x1b[0m',
	
	FgBlack : '\x1b[30m' + '%s\x1b[0m',
	FgRed : '\x1b[31m' + '%s\x1b[0m',
	FgGreen : '\x1b[32m' + '%s\x1b[0m',
	FgYellow : '\x1b[33m' + '%s\x1b[0m',
	FgBlue : '\x1b[34m' + '%s\x1b[0m',
	FgMagenta : '\x1b[35m' + '%s\x1b[0m',
	FgCyan : '\x1b[36m' + '%s\x1b[0m',
	FgWhite : '\x1b[37m' + '%s\x1b[0m',
	FgGray : '\x1b[90m' + '%s\x1b[0m',
	
	BgBlack : '\x1b[40m' + '%s\x1b[0m',
	BgRed : '\x1b[41m' + '%s\x1b[0m',
	BgGreen : '\x1b[42m' + '%s\x1b[0m',
	BgYellow : '\x1b[43m' + '%s\x1b[0m',
	BgBlue : '\x1b[44m' + '%s\x1b[0m',
	BgMagenta : '\x1b[45m' + '%s\x1b[0m',
	BgCyan : '\x1b[46m' + '%s\x1b[0m',
	BgWhite : '\x1b[47m' + '%s\x1b[0m',
	BgGray : '\x1b[100m' + '%s\x1b[0m'
}

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function generatePosition () {
	return {
		x: getRandomInt(FIELD_SIZE - 1),
		y: getRandomInt(FIELD_SIZE - 1),
	}
}

export const getEmptyNeighbors = (y: number, x: number, enemy: Field, emptyNeighbors: Set<Position> = new Set() ) => {
	// const emptyNeighbors: Set<Position> = new Set();

	const addCellIfEmpty = (y: number, x: number) => {
		const curCell = enemy[y][x];
		if (curCell === Cell.empty || curCell === Cell.miss) {
			emptyNeighbors.add({
				x, y
			})
		} else {
			if (curCell === Cell.shot) getEmptyNeighbors(y, x, enemy, emptyNeighbors);
		}
	}
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

	return emptyNeighbors;
}


export const isPartOfAliveShip = (y: number, x: number, enemy: Array<Array<Cell>>, shipPartsAround: Set<string> = new Set() ) => {
	//a set for cells with ships parts nearby
	// const shipPartsAround: Set<string> = new Set();

	const addCellIfShip = (y: number,  x: number) => {
		const curCell = enemy[y][x];
		const cellStr = [y, x, enemy[y][x]].join('-');
	
		//  save alive cells of ship
		if (curCell === Cell.ship) {
			shipPartsAround.add(cellStr);
		}
		// save dead cell if absent
		if (curCell === Cell.shot)
			if (!shipPartsAround.has(cellStr)) {
				shipPartsAround.add(cellStr);
				 isPartOfAliveShip(y, x, enemy, shipPartsAround);
			}
	}

	// check only for directions
	if (y > 0) addCellIfShip(y - 1, x);
	if (x > 0) addCellIfShip(y, x - 1);
	if (y < FIELD_SIZE - 1) addCellIfShip(y + 1, x);
	if (x < FIELD_SIZE - 1) addCellIfShip(y, x + 1);

	let result = false;
	shipPartsAround.forEach((cell) => {
		if(cell.endsWith(Cell.ship)) {
			result = true;
		}
	})

	return result;
};