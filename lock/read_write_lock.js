export class ReadWriteLock {
	constructor() {
		this.readers = 0; // 当前持有读锁的数量
		this.writer = false; // 当前是否有写锁
		this.readQueue = []; // 等待获取读锁的队列
		this.writeQueue = []; // 等待获取写锁的队列
	}

	/**
	 * 获取读锁
	 */
	async rLock() {
		// 如果当前有写锁或有等待的写锁请求，则将当前请求加入读锁队列
		if (this.writer || this.writeQueue.length > 0) {
			await new Promise(resolve => this.readQueue.push(resolve));
		}
		this.readers++; // 增加持有读锁的数量
	}

	/**
	 * 释放读锁
	 */
	rUnlock() {
		this.readers--; // 减少持有读锁的数量
		// 如果没有持有读锁的请求且有等待的写锁请求，则处理写锁请求
		if (this.readers === 0 && this.writeQueue.length > 0) {
			const resolve = this.writeQueue.shift();
			resolve();
		}
	}

	/**
	 * 获取写锁
	 */
	async lock() {
		// 如果当前有写锁或有持有读锁的请求，则将当前请求加入写锁队列
		if (this.writer || this.readers > 0) {
			await new Promise(resolve => this.writeQueue.push(resolve));
		}
		this.writer = true; // 设置写锁
	}

	/**
	 * 释放写锁
	 */
	unlock() {
		this.writer = false; // 释放写锁
		// 如果有等待的读锁请求，则处理所有读锁请求
		if (this.readQueue.length > 0) {
			while (this.readQueue.length > 0) {
				const resolve = this.readQueue.shift();
				resolve();
			}
		} else if (this.writeQueue.length > 0) {
			// 如果没有等待的读锁请求但有等待的写锁请求，则处理写锁请求
			const resolve = this.writeQueue.shift();
			resolve();
		}
	}
}

/**
 * 执行读锁任务
 * @param {ReadWriteLock} lock 读写锁
 * @param {number} timeout 超时时间
 * @param {function () {  }}
 * @returns {boolean|any}
 */
export const readLock = async (lock = null, timeout = 0, fn = function () { }) => {
	if (!lock || timeout <= 0) return [null, false];

	await lock.rLock();
	const ret = fn();
	setTimeout(() => lock.rUnlock(), timeout);
	return [ret, true];
};

/**
 * 执行写锁任务
 * @param {ReadWriteLock} lock 读写锁
 * @param {number} timeout 超时时间
 * @param {function () {}} fn 执行命令
 * @returns {boolean|any}
 */
export const writeLock = async (lock = null, timeout = 0, fn = function () { }) => {
	if (!lock || timeout <= 0) return [null, false];

	await lock.lock();
	const ret = fn();
	setTimeout(() => lock.unlock(), timeout);
	return [ret, true];
};

// example usage
if (require.main == module) {
	const lock = new ReadWriteLock();

	readLock(lock, 1000, () => console.log("read 1"));
	writeLock(lock, 2000, () => console.log("write 1"));
	readLock(lock, 1000, () => console.log("read 2"));
	writeLock(lock, 2000, () => console.log("write 2"));
}