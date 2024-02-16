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
	})

	register = (id: number) => {
		this.wins = 0;
		this.index = id;
		this.error = false;
		this.errorText = '';
		this.wins = 0;
		usersDB.push(this.getDBInterface())
	}
}

export const getWinners = () =>{
	const table = usersDB.map(user => ({
			name: user.name,
			wins: user.wins,
		}));

		table.sort((w1, w2) => w1.wins - w2.wins);
		return table || [];
} 
