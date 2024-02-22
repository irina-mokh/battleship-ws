import {  wsAPI, BotApi } from '../types';
import { fontLog, generateID } from '../utils';
import { getGameById } from '../models/game';
import WebSocket from 'ws';
import { handleBot } from './botController';
import { userLeave, userRegister } from './userController';
import {  roomCreate, roomJoin } from './roomController';
import { gameAddShips, handleAttack } from './gameController';

import { Client, clientsDB } from '../models/client';

export const handleWS = (ws: WebSocket) => {
	const id = generateID();
	const client = new Client(ws);
	clientsDB.set(id, client);

	handleBot(ws, id);

	ws.on('message', ((msg) => { 
		const request = JSON.parse(String(msg));
		let { type } = request;
		const data =  request.data && JSON.parse(request.data); 
		console.log(fontLog.BgGreen, 'Received data: ', data);
		
		switch (type) {
			case wsAPI.reg:
				client.user = userRegister(data, id);
				break;
			case wsAPI.createRoom:
				roomCreate(client.user, id);
				break;
			case wsAPI.joinRoom:
				roomJoin(data.indexRoom, id);
				break;	
			case wsAPI.addShips:
				gameAddShips(data);
				break;
			case wsAPI.randomAttack:
				const currentGame = getGameById(data.gameId);
				const position = currentGame.randomAttack();
				const randomAttackData = {
					...data,
					...position,
				};
				handleAttack(randomAttackData, id);
				break;

			case wsAPI.attack:
				handleAttack(data, id)
				break;

			case wsAPI.singlePlay:
				ws.emit(BotApi.start);
				client.singlePlay = true;
				break;
		}
	}));

	ws.on('close', () => {
		userLeave(id);
	})
}
