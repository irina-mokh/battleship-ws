import { clientsDB } from '../models/client';
import { wss } from '..';
import { fontLog } from '../utils';

export const send = (msg: string, ids: Array<number> = []) => {
	console.log(fontLog.BgCyan, '->> Send:', msg);
	if (ids.length) {

		// send to certain id's
		ids.forEach(id => {
			if (clientsDB.has(id)) {
				clientsDB.get(id).ws.send(msg);
			}
		})
	} else {
		// send to all clients
		wss.clients.forEach((client) => {
			client.send(msg);
		});
	}
};