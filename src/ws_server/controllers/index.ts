import { wsAPI, wsMsg } from '../types';
import { parseData, stringData } from '../utils';
import { User } from '../models/usersController';

export const handleWS = (ws: WebSocket, req) => {
	console.log(req);
	ws.onerror = () => console.error;
	
	ws.onmessage = (msg: {data: string}) => { 
		const request: wsMsg = parseData(msg.data);
		const { type, data } = request;
		
		switch (type) {
			case 'reg':
				let user = new User({...data});
				
				if (user.exists() && !user.validPass()) {
					user.error = true;
					user.errorText = 'User already exists, wrong password';
					console.log('EXISTS: ', user.getDBInterface())
				} else {
					user.register();
					console.log(user.getDBInterface());
				}
				ws.send(stringData(wsAPI.reg, user.getDBInterface()));
				break;
			}	
			
	};
	
		


}