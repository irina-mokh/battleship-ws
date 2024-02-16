import { wsMsg, UserDB } from '../types';

export const usersDB: UserDB[] = [];

export class User {
	name: string;
	password: string;
	index: number;
	wins: number;
	error: boolean;
	errorText: string;

	constructor ({name, password}) {
		this.name = name;
		this.password = password;
	}

	exists = () => usersDB.find(user => user.name === this.name)

	validPass = () => usersDB.find(user => user.name === this.name).password === this.password

	getDBInterface = () => ({
		name: this.name,
		password: this.password,
		index: this.index,
		error: this.error,
		errorText: this.errorText,
		// wins: this.wins,
	})

	register = (id: number) => {
		this.wins = 0;
		this.index = id;
		this.error = false;
		this.errorText = '';
		usersDB.push(this.getDBInterface())
	}
}

