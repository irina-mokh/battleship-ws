export enum wsAPI {
	reg = 'reg',
	updateWinners = 'update_winners',
	createRoom = 'create_room',
	updateRoom = 'update_room',
	joinRoom = 'add_user_to_room',
	createGame = 'create_game',
	addShips = 'add_ships',
	startGame = 'start_game',
	attack = 'attack',
	randomAttack = 'randomAttack',
	turn = 'turn',
	finish = 'finish',
}

export enum ATTACK_STATUSES {
	miss = 'miss',
	killed = 'killed',
	shot = 'shot',
}
export interface UserFront {
	name: string;
	password: string;
}

export interface GameFront {
	gameId: number;
  ships: Array<Ship>;
  indexPlayer: number;
}

export interface wsMsg {
  type: wsAPI;
  data: string;
  id: number;
}

export interface UserDB extends UserFront{
	wins?: number;
	index: number;
	error: boolean;
	errorText: string;

}

export interface RoomDB {
	roomId: number;
	roomUsers: Array<Partial<UserDB>>;
}

export type Field = Array<Array<Cell>>
export interface GameDB {
	gameId: number;
	player1: GamePlayer;
	player2: GamePlayer;
	field1: Field;
	field2: Field;
	turnIndex: number;
	isFirstTurn: boolean;
}

export interface GamePlayerFront {
	indexPlayer: number;
	ships: Array<Ship>
}

export interface GamePlayer {
	currentPlayerIndex: number;
	ships: Array<Ship>;
}

type ShipType = "small"|"medium"|"large"|"huge";

export interface Ship {
	type: ShipType;
	position: Position,
	direction: boolean;
	length: number;
}

export interface AttackFront extends Position {
	gameId: number;
	indexPlayer: number;
}

export interface Position {
	x: number;
	y: number;
}

export enum Cell {
	empty = '-',
	miss = '0',
	ship = '+',
	shot = 'x',
	dead = 'X',
}