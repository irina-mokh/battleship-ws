
import { Bot } from '../models/bot';
import { BotApi } from '../types';
import {  getUserByIndex, usersDB } from '../models/user';
import { fontLog } from '../utils';
import WebSocket from 'ws';

export const handleBot = (ws:  WebSocket, userId: number) => {
	let bot: Bot;

	const user = getUserByIndex(userId);

	ws.on(BotApi.start, () => { 
		console.log('SINGLE PLAY');
		bot = new Bot(user);
		ws.emit('message', bot.start());
		// ws.emit(BotApi.set);
		ws.emit('message', bot.addShips());

		console.log('Bot: ', bot.index);
		console.log(fontLog.BgGray, 'USER DB: ', usersDB);
	});

	ws.on(BotApi.attack, () => {
		setTimeout(() => {
			ws.emit('message', bot.attack())}
			, 1000);
	})
}