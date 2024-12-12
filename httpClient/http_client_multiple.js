import collect from 'collect.js';
import { HttpClient, HttpMethods } from './http_client';

class MultipleHttpClient {
	constructor() {
		this.clients = collect([]);
	}

	addClient(client) {
		this.clients.push(client);
		return this;
	}

	addClients(...clients) {
		this.clients.push(...clients);
		return this;
	}

	setClients(clients) {
		this.clients = clients;
		return this;
	}

	async send() {
		await Promise.all(this.clients.map(client => client.send()));
		return this;
	}

	getClients() {
		return this.clients;
	}
}

// example usage
if (require.main == module) {
	const client1 = HttpClient.newGet("https://www.baidu.com");
	const client2 = HttpClient.newGet('https://www.google.com');

	let multipleHttpClient = new MultipleHttpClient();
	multipleHttpClient = await multipleHttpClient.addClients(client1, client2).send();
	collect(multipleHttpClient.getClients()).each(client => {
		if (client.error) {
			console.error(`err: ${client.url} -> ${client.error}`);
		} else {
			console.log(`ok: ${client.responseBody}`);
		}
	});
}
