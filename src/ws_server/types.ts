export enum wsAPI {
	reg = 'reg',
	
}

export interface UserFront {
	name: string;
	password: string;
}

export interface wsMsg {
  type: wsAPI,
  data: UserFront,
  id: number,
}

export interface UserDB extends UserFront{
	wins: number;
	index: number;
	error: boolean;
	errorText: string;
}