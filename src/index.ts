import { httpServer } from "./http_server";
import { WS_PORT, runWss, wss } from './ws_server';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

runWss();

process.on('SIGINT', () => {
	httpServer.close(() => {
		console.log(`HTTP server at ${HTTP_PORT} port is closing.`);
	});
	wss.close(() => {
		console.log(`Web socket server at ${WS_PORT} port is closing`);
	});
});