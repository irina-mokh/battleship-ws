import { WebSocketServer } from 'ws';
import { httpServer } from "./http_server";
import { runWss } from './ws_server';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

runWss();