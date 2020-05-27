import path from 'path';
import fs from 'fs';

export interface IServerInfo {
	smtp: {
		host: string;
		port: number;
		auth: { user: string; pass: string };
	};
	imap: {
		host: string;
		port: number;
		auth: { user: string; pass: string };
	};
}

export let serverInfo: IServerInfo;
const rawInfo: Buffer = fs.readFileSync(path.join(__dirname, '../serverInfo.json'));

serverInfo = JSON.parse(JSON.stringify(rawInfo));
