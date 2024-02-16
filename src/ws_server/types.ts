export enum wsAPI {
	reg = 'reg',
	createRoom = 'create_room',
	updateRoom = 'update_room',
	joinRoom = 'add_user_to_room',
	createGame = 'create_game'
	
}

export interface UserFront {
	name: string;
	password: string;
}

export interface wsMsg {
  type: wsAPI,
  data: string,
  id: number,
}

export interface UserDB extends UserFront{
	// wins: number;
	index: number;
	error: boolean;
	errorText: string;
}

export interface RoomDB {
	roomId: number;
	roomUsers: Array<Partial<UserDB>>
}