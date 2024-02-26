
import { Bot } from '../models/bot';
import {  getUserByIndex } from '../models/user';
import { BotApi } from '../types';
import WebSocket from 'ws';

export const handleBot = (ws:  WebSocket, userId: number) => {
	let bot: Bot;
	const user = getUserByIndex(userId);
	ws.on(BotApi.start, () => { 
		bot = new Bot(user);
		ws.emit('message', bot.start());
		ws.emit('message', bot.addShips());
	});

	ws.on(BotApi.attack, () => {
		setTimeout(() => {
			ws.emit('message', bot.attack())}
			, 1000);
	})
}