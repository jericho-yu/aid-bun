import { IpLimiter } from "./ip_limiter.js";

export class RouteLimiter {
	constructor() {
		this.routeSetMap = new Map();
	}

	/**
	 * 增加路由规则
	 * @param {string} route 路由规则
	 * @param {number} duration 时间间隔
	 * @param {number} maxVisitTimes 最大访问次数
	 * @returns {RouteLimiter}
	 */
	add(route, duration, maxVisitTimes) {
		this.routeSetMap.set(route, { ipLimiter: new IpLimiter(), duration, maxVisitTimes });
		return this;
	}

	/**
	 * 确认是否通行
	 * @param route
	 * @param ip
	 * @returns {Promise<[null,boolean]|[any,boolean]|boolean[]>}
	 */
	async affirm(route, ip) {
		const routeConfig = this.routeSetMap.get(route);
		if (routeConfig) {
			return routeConfig.ipLimiter.affirm(ip, routeConfig.duration, routeConfig.maxVisitTimes);
		}
		return [null, true];
	}
}

// example usage
if (require.main == module) {
	const routeLimiter = new RouteLimiter().add("/api", 60000, 5); // 1 minute duration, max 5 visits

	for (let i = 0; i < 10; i++) {
		const [visit, allowed] = await routeLimiter.affirm('/api', '192.168.1.1');
		console.log(visit, allowed); // true or false
	}
}

