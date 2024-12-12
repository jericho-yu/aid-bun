import read_write_lock from './read_write_lock';

class MapLock {
	constructor() {
		this.lock = new read_write_lock.ReadWriteLock();
		this.data = {};
	}

	/**
	 * 通过键获取内容
	 * @param {string} key 键
	 * @returns {any|null}
	 */
	async get(key = '') {
		return read_write_lock.readLock(this.lock, () => {
			return this.data?.[key];
		});
	}

	/**
	 * 设置键值对
	 * @param {string} key 键
	 * @param {any|null} value 值
	 * @param {number} timeout 超时时间
	 */
	async set(key = '', value = null, timeout = 0) {
		read_write_lock.writeLock(this.lock, () => {
			this.data[key] = value;
		});
	}
}

export default { MapLock };

if (require.main == module) {
	const lock = new MapLock();
	await lock.set('key', 'value');
	const val = await lock.get('key');
	console.log(val);
}