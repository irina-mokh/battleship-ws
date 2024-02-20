import { UserDB } from '../types';

export const usersDB: User[] = [];

export interface User extends UserDB { }
export class User {
	constructor ({name, password}) {
		this.name = name;
		this.password = password;
	}

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
		usersDB.push(this);
	}
}

export const getWinners = () =>{
	const table = usersDB.map(user => ({
			name: user.name,
			wins: user.wins,
		}))
		.filter(u => u.wins > 0)
		.sort((w1, w2) => w2.wins - w1.wins);
		return table;
} 

export const userExists: (name: string) => User | undefined = (name) => usersDB.find(user => user.name === name)