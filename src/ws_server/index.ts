import { WebSocketServer  } from 'ws';
import { handleWS } from './controllers';

export const WS_PORT = 3000;

export const wss = new WebSocketServer({port: WS_PORT});
console.log(`Start web socket server on the ${WS_PORT} port!`);

export const runWss = () => {
	wss.on('connection', handleWS);
}