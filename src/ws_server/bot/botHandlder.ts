import { WebSocketServer } from 'ws';
import { Bot } from '../controllers/botController';
import { BotApi } from '../types';

import { User, usersDB } from '../controllers/usersController';
import { fontLog } from '../utils';

export const handleBot = (ws: WebSocketServer, user: User) => {
	let bot: Bot;

	ws.on(BotApi.start, () => { 
		console.log('SINGLE PLAY');
		bot = new Bot(user);
		ws.emit('message', bot.start());
		ws.emit(BotApi.set);
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