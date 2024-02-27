import WebSocket from 'ws';
import { User } from './models/user';

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
	singlePlay = 'single_play'
}

export enum BotApi {
	start = 'bot_start',
	set = 'bot_set_ships',
	attack = 'bot_attack',
}

export enum ATTACK_STATUSES {
	miss = 'miss',
	killed = 'killed',
	shot = 'shot',
	err = 'error',
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

export interface ClientDB {
	ws: WebSocket;
	singlePlay: boolean;
	user: User;
}

export interface UserDB extends UserFront{
	wins?: number;
	index: number;
	error: boolean;
	errorText: string;
	isBot?: boolean;
}

export interface RoomDB {
	roomId: number;
	roomUsers: Array<Partial<UserDB>>;
	ids: Array<number>;
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
	winPlayer?: number;
	unorderedIds: Array<number>;
}

export interface GamePlayerFront {
	indexPlayer: number;
	ships: Array<Ship>
}

export interface GamePlayer {
	currentPlayerIndex: number;
	ships?: Array<Ship>;
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