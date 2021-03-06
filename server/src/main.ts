import path from 'path';
import express, { Express, NextFunction, Request, Response } from 'express';
import { serverInfo } from './ServerInfo';
import * as IMAP from './IMAP';
import * as SMTP from './SMTP';
import * as Contacts from './Contacts';
import { IContact } from './Contacts';

const app: Express = express();
const PORT = 8008;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Dealling with CORS issues and allowing access to the API
app.use((_inRequest: Request, inResponse: Response, inNext: NextFunction) => {
	inResponse.header('Access-Control-Allow-Origin', '*');
	inResponse.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
	inResponse.header(
		'Access-Control-Allow-Headers',
		'Origin,X-Requested-With,Content-Type,Accept',
	);

	inNext();
});

app.get('/', (_inRequest: Request, inResponse: Response) => {
	inResponse.status(200).json({
		message: 'API working!',
	});
});

// GET: retrieves all mailboxes
app.get('/mailboxes', async (_inRequest: Request, inResponse: Response) => {
	try {
		const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
		const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailBoxes();

		inResponse.json(mailboxes);
	} catch (inError) {
		inResponse.send('error');
	}
});

// GET: retrieves a particular mailbox
app.get(
	'/mailboxes/:mailbox',
	async (inRequest: Request, inResponse: Response) => {
		try {
			const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
			const messages: IMAP.IMessage[] = await imapWorker.listMessages({
				mailbox: inRequest.params.mailbox,
			});

			inResponse.json(messages);
		} catch (inError) {
			inResponse.send('error');
		}
	},
);

// GET: retrieve a particular message from a mailbox
app.get(
	'/messages/:mailbox/:id',
	async (inRequest: Request, inResponse: Response) => {
		try {
			const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
			const message: string | undefined = await imapWorker.getMessageBody({
				mailbox: inRequest.params.mailbox,
				id: parseInt(inRequest.params.id, 10),
			});

			// Message body sent as plain-text
			inResponse.send(message);
		} catch (inError) {
			inResponse.send('error');
		}
	},
);

// DELETE: delete a message
app.delete(
	'/messages/:mailbox/:id',
	async (inRequest: Request, inResponse: Response) => {
		try {
			const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
			await imapWorker.deleteMessage({
				mailbox: inRequest.params.mailbox,
				id: parseInt(inRequest.params.id, 10),
			});

			inResponse.send('ok!');
		} catch (inError) {
			inResponse.send('error');
		}
	},
);

// POST: send a message
app.post('/messages', async (inRequest: Request, inResponse: Response) => {
	try {
		const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
		await smtpWorker.sendMessage(inRequest.body);

		inResponse.send('ok!');
	} catch (inError) {
		inResponse.send('error');
	}
});

// GET: retrieves all contacts
app.get('/contacts', async (_inRequest: Request, inResponse: Response) => {
	try {
		const contactsWorker: Contacts.Worker = new Contacts.Worker();
		const contacts: IContact[] = await contactsWorker.listContacts();

		inResponse.json(contacts);
	} catch (inError) {
		inResponse.send('error');
	}
});

// POST: add a contact
app.post('/contacts', async (inRequest: Request, inResponse: Response) => {
	try {
		const contactsWorker: Contacts.Worker = new Contacts.Worker();
		const contact: IContact = await contactsWorker.addContact(inRequest.body);

		inResponse.status(201).json(contact);
	} catch (inError) {
		inResponse.send('error');
	}
});

// Put: Update a contact
app.put('/contacts/:id', async (inRequest: Request, inResponse: Response) => {
	try {
		const contactsWorker: Contacts.Worker = new Contacts.Worker();
		const contact: IContact = await contactsWorker.updateContact(
			inRequest.body,
			inRequest.params._id,
		);

		inResponse.status(203).json(contact);
	} catch (error) {
		inResponse.status(500).json({ error });
	}
});

// DELETE: delete a specified contact
app.delete(
	'/contacts/:id',
	async (inRequest: Request, inResponse: Response) => {
		try {
			const contactsWorker: Contacts.Worker = new Contacts.Worker();
			await contactsWorker.deleteContact(inRequest.params.id);

			inResponse.send('ok!');
		} catch (inError) {
			inResponse.send('error');
		}
	},
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
