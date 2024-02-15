import { WebSocketServer  } from 'ws';
import { handleWS } from './controllers';

const WS_PORT = 3000;

export const wss = new WebSocketServer({port: WS_PORT});
export const runWss = () => {
	wss.on('connection', handleWS);
}