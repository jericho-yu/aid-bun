import redis from 'redis';
import redis_setting from "./redis_setting.js";
import filesystem from "../filesystem/filesystem.js";
import collect from 'collect.js';

class RedisPool {
	/**
	 * 通过配置文件路径实例化
	 * @param {string} filename 配置文件路径
	 * @returns {RedisPool}
	 */
	static newByRedisSettingFile(filename = '') {
		return new RedisPool(new redis_setting.RedisSetting(filesystem.FileSystem.newByRelative(filename).getDir()).readSetting());
	}

	constructor(redisSetting = {}) {
		this.redisSetting = redisSetting;
		this.connections = {};
		collect(this.redisSetting?.pool).
			each(pool => {
				const client = new redis.createClient({
					host: pool.host,
					port: pool.port,
					password: pool.password,
					db: pool.db
				});
				client.on('error', err => console.error(`Redis client err: ${err}`));

				this.connections[pool.key] = { prefix: pool.prefix, client };
			});

		this.connections = collect(this.connections);
	}

	get(clientName = '', key = '') { }

	/**
	 * 设置值
	 * @param {string} clientName 客户端名称
	 * @param {string} key 键
	 * @param {any} value 值
	 * @param {number} expire 过期时间
	 * @returns {RedisPool}
	 */
	async set(clientName = '', key = '', value = '', expire = 0) {
		const conn = this.connections.get(clientName);
		if (conn){
			await conn.client.set(this._getKey(clientName, key), value);
		}
		// await this.connections.get(clientName)?.client.set(this._getKey(clientName, key), value);
		// if (expire > 0) await this.connections.get(clientName)?.client.expire(this._getKey(clientName, key), expire);
		// return this;
	}

	/**
	 * 获取带有前缀的键
	 * @param {string} clientName 客户端名称
	 * @param {string} key 键
	 * @returns {string}
	 */
	_getKey(clientName = '', key = '') {
		const prefix = this.connections.get(clientName)?.prefix;
		return `${prefix}${prefix ? ':' : ''}${key}`;
	}
}

if (require.main === module) {
	async function main() {
		const redisPool = RedisPool.newByRedisSettingFile("redisPool/redis.yaml");
		// console.log("OK", redisPool.connections.keys());
		await redisPool.set("auth", "key1", "value1", 100);
	}

	main().catch(console.error);
}
