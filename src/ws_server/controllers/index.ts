import { UserDB, wsAPI, wsMsg } from '../types';
import { generateID, stringifyData } from '../utils';
import { User } from '../models/usersController';
import { IncomingMessage } from 'http';
import { wss } from '..';
import { Room, getRoomById, roomsDB } from '../models/roomsController';

const CLIENTS = {};
export const handleWS = (ws: WebSocket, req: IncomingMessage) => {
	const id = generateID();
	console.log('ID: ', id);
	CLIENTS[id] = ws;

	let curUser: UserDB;

	const broadcast = (msg: string, ids = []) => {
		console.log('->> Broadcast:', msg);
		if (ids.length) {
			ids.forEach(id => {
				const targetClient = CLIENTS[id];
				targetClient.send(msg);
			})
		} else {
			wss.clients.forEach((client) => {
					client.send(msg);
			 });
		}
	};

	ws.onerror = () => console.error;
	
	ws.onmessage = (msg: {data: string}) => { 
		const request: wsMsg = JSON.parse(msg.data);
		const { type } = request;

		const data =  request.data && JSON.parse(request.data); 
		
		switch (type) {
			case wsAPI.reg:
				let user = new User({...data});
				
				if (user.exists() && !user.validPass()) {
					user.error = true;
					user.errorText = 'User already exists, wrong password';
				} else {
					user.register(id);
				}
				curUser = user.getDBInterface();
				ws.send(stringifyData(wsAPI.reg, curUser));
				break;

			case wsAPI.createRoom:
				const room = new Room(curUser);
				if (!room.exists(curUser.name)) {
					room.create();
					// broadcast to all clients about new room creation
					broadcast(stringifyData(wsAPI.updateRoom, roomsDB));
				} else {
					console.log('This user already has one room')
				}
				break;

			case wsAPI.joinRoom:
				console.log('ROOMS: ', roomsDB);
				const targetRoom = getRoomById(data.indexRoom);
				targetRoom.addUser(curUser);
				targetRoom.delete();

				// broadcast ALL: remove room from available
				broadcast(stringifyData(wsAPI.updateRoom, roomsDB));

				// broadcast TWO users for game creation
				broadcast(stringifyData(wsAPI.createGame, {
					idGame: targetRoom.roomId,
					idPlayer: curUser.index,
				}), []);


				break;
			}				
	};
}

