import { ReadWriteLock } from "./read_write_lock";

export class LockItem {
	/**
	 * 构造函数
	 * @param {ReadWriteLock} lock 读写锁
	 * @param {number} timeout 超时时间
	 */
	constructor(lock = null, timeout = 0) {
		if (!lock || timeout <= 0) {
			return;
		}

		this.lock = lock;
		this.timeout = timeout;
	}
}