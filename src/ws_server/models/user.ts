import { UserDB } from '../types';

export const usersDB: User[] = [];
export interface User extends UserDB { }
export class User {
	constructor ({name, password}) {
		this.name = name;
		this.password = password;
	}

	validPass = (pass: string) => usersDB.find(user => user.name === this.name).password === pass

	getDBInterface = () => ({
		name: this.name,
		password: this.password,
		index: this.index,
		error: this.error,
		errorText: this.errorText,
	})

	register = (index: number) => {
		this.wins = 0;
		this.index = index;
		this.error = false;
		this.errorText = '';
		this.wins = 0;
		this.isBot = false;
		usersDB.push(this);
	}

	removeErr =  () => {
		this.error = false;
		this.errorText = '';
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


export const getUserByIndex: (index: number) => User | undefined = (index): User => usersDB.find(user => user.index === index);

export const getUserByName: (name: string) => User | undefined = (name): User => usersDB.find(user => user.name === name);