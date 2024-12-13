import fs from 'fs';
import yaml from 'js-yaml';

class RedisSettingFileNotExist extends Error {
    constructor(msg) {
        super(msg);
        this.name = this.constructor.name;
    }
}

class RedisSetting {
    /**
     * 构造函数
     * @param {string} dir 文件路径
     */
    constructor(dir = '') {
        this.dir = dir;
    }

    /**
     * 读取配置文件路径
     * @returns {string} 文件路径
     */
    readDir() {
        return this.dir;
    }

    /**
     * 设置配置文件路径
     * @param {string} dir 文件路径
     * @returns {RedisSetting}
     */
    setDir(dir = '') {
        this.dir = dir;
        return this;
    }

    /**
     * 读取配置文件
     * @returns {any} 配置文件内容
     */
    readSetting() {
        if (!fs.existsSync(this.dir)) throw new RedisSettingFileNotExist(`文件不存在：${this.dir}`);
        return yaml.load(fs.readFileSync(this.dir, "utf8"));
    }
}

export default {RedisSetting, RedisSettingFileNotExist};