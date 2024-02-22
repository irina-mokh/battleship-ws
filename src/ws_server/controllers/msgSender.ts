import { wss } from '..';
import { fontLog } from '../utils';
import { clientsDB } from '../models/client';

export const send = (msg: string, ids: Array<number> = []) => {
	console.log(fontLog.BgCyan, '->> Send:', msg);
	if (ids.length) {
		// console.log(fontLog.BgCyan, "To clients: ", ids);

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