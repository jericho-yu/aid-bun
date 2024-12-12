import { Redis } from 'ioredis';
import {}

class RedisPool {
	constructor(redisSetting) {
		this.connections = new Map();
		this.connections = 
		this.init(redisSetting);
	}

	init(redisSetting) {
		if (redisSetting.pool.length > 0) {
			redisSetting.pool.forEach(pool => {
				const client = new Redis({
					host: redisSetting.host,
					port: redisSetting.port,
					password: redisSetting.password,
					db: pool.dbNum,
				});
				const prefix = `${redisSetting.prefix}:${pool.prefix}`;
				this.connections.set(pool.key, { prefix, client });
			});
		}
	}

	getClient(key) {
		const connection = this.connections.get(key);
		if (connection) {
			return connection;
		}
		return { prefix: '', client: null };
	}

	async get(clientName, key) {
		const { prefix, client } = this.getClient(clientName);
		if (!client) {
			throw new Error(`No Redis connection found for key: ${clientName}`);
		}
		const result = await client.get(`${prefix}:${key}`);
		return result || null;
	}

	async set(clientName, key, value, exp) {
		const { prefix, client } = this.getClient(clientName);
		if (!client) {
			throw new Error(`No Redis connection found for key: ${clientName}`);
		}
		await client.set(`${prefix}:${key}`, value, 'EX', exp);
	}

	async close(key) {
		const connection = this.connections.get(key);
		if (connection) {
			await connection.client.quit();
			this.connections.delete(key);
		}
	}

	async clean() {
		for (const [key, connection] of this.connections) {
			await connection.client.quit();
			this.connections.delete(key);
		}
	}
}

module.exports = RedisPool;