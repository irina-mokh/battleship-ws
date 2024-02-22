import WebSocket from 'ws';
import { ClientDB } from '../types';

export const clientsDB = new Map<number, ClientDB>();

export interface Client extends ClientDB {}
 export class Client {
	constructor (ws: WebSocket) {
		this.ws = ws;
		this.singlePlay = false;
	}

 } 