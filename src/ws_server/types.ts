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

export interface UserFront {
	name: string;
	password: string;
}

export interface GameFront {
	gameId: number,
  ships: Array<Ship>
  indexPlayer: number,
}

export interface wsMsg {
  type: wsAPI,
  data: string,
  id: number,
}

export interface UserDB extends UserFront{
	wins?: number;
	index: number;
	error: boolean;
	errorText: string;

}

export interface RoomDB {
	roomId: number;
	roomUsers: Array<Partial<UserDB>>	
}

export interface GameDB {
	gameId: number;
	player1: GamePlayer;
	player2: GamePlayer;
}

export interface GamePlayerFront {
	indexPlayer: number;
	ships: Array<Ship>
}

export interface GamePlayer {
	currentPlayerIndex: number;
	ships: Array<Ship>
}

type ShipType = "small"|"medium"|"large"|"huge";

interface Ship {
	type: ShipType;
	position: {
		x: number,
		y: number,
	},
	direction: boolean,
	length: number,
}

