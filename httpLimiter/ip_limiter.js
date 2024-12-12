export class Visit {
	constructor() {
		this.lastVisit = new Date();
		this.visitTimes = 1;
	}

	/**
	 * 获取最后访问
	 * @returns {Date}
	 */
	getLastVisit() {
		return this.lastVisit;
	}

	/**
	 * 获取访问次数
	 * @returns {number}
	 */
	getVisitTimes() {
		return this.visitTimes;
	}

	/**
	 * 增加访问次数
	 * @returns {void}
	 */
	incrementVisitTimes() {
		this.visitTimes++;
	}

	/**
	 * 重置访问记录
	 * @returns {void}
	 */
	reset() {
		this.visitTimes = 1;
		this.lastVisit = new Date();
	}

	/**
	 * 更新最后访问
	 * @returns {void}
	 */
	updateLastVisit() {
		this.lastVisit = new Date();
	}
}

export class IpLimiter {
	constructor() {
		this.visitMap = new Map();
	}

	/**
	 * 确认是否通行
	 * @param {string} ip IP地址
	 * @param {number} duration 访问间隔
	 * @param {number} maxVisitTimes 最大访问次数
	 * @returns {[Visit,boolean]}
	 */
	async affirm(ip, duration, maxVisitTimes) {
		if (maxVisitTimes === 0 || duration === 0) {
			return [null, true];
		}

		let visit = this.visitMap.get(ip);

		if (!visit) {// 不存在记录，创建新记录
			visit = new Visit();
			this.visitMap.set(ip, visit);
			return [visit, true];
		} else {
			if (new Date() - visit.getLastVisit() > duration) {// 超时，重置时间，重置访问次数，返回true
				visit.reset();
				return [visit, true];
			} else if (visit.getVisitTimes() >= maxVisitTimes) {// 超过访问次数，增加访问次数，更新时间，返回false
				visit.incrementVisitTimes();
				visit.updateLastVisit();
				return [visit, false];
			} else {// 未超过访问次数，增加访问次数，更新时间，返回true
				visit.incrementVisitTimes();
				visit.updateLastVisit();
				return [visit, true];
			}
		}
	}
}


if (require.main == module) {
	const ipLimiter = new IpLimiter();

	for (let i = 0; i < 10; i++) {
		const [visit, allowed] = await ipLimiter.affirm('127.0.0.1', 60000, 5);
		console.log(visit, allowed);
	}
}