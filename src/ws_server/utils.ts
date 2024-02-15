import { Http2ServerRequest } from 'http2';
import { wsAPI, wsMsg } from './types';

export const parseData = (req: string) => {
	const parsed = JSON.parse(req);

	return {
		type: parsed.type,
		data: JSON.parse(parsed.data),
		id: 0
	}
}

export const stringData = (type: wsAPI, data) => {

	return JSON.stringify({
		type: type,
		data: JSON.stringify(data),
		id: 0
	})
}