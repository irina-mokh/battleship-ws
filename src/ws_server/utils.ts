import { wsAPI } from './types';

export const stringifyData = (type: wsAPI, data: unknown) => {

	return JSON.stringify({
		type: type,
		data: JSON.stringify(data),
		id: 0
	})
}

export const generateID = () => Number(String((new Date()).getTime()) + Math.floor((Math.random()*100)));