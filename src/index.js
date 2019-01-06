/**
 * @file js 消息队列
 * @author Marx
 */

/**
 * 一个简单的消息队列
 */
module.exports = class PromiseMq {

    /**
     * 消息队列的构造函数
     *
     * @param {Function} consumer 消费数据的函数，必须返回 Promise 否则会报错。
     * @param {Object} option 配置信息： option.size 窗口大小，默认 4；option.retryTimes 重试次数，默认 1
     */
    constructor(consumer, option = {}) {
        if (!consumer) {
            console.warn('需要添加一个消耗数据的函数');
            return;
        }
        this.consumer = consumer;
        this.size = option.size || 4;
        this.activeIndex = 0;
        this.bufferedData = new Map();
        this.processData = new Map();
        this.store = [];
        this.retryTimes = option.retryTimes || 1;
        this.retryMap = new Map();
    }

    /**
     * 往队列里添加数据
     *
     * @param {any} data 数据
     */
    addData(data) {
        this.store.push(data);
        if (!this.isFull()) {
            this.addtobuffer(this.activeIndex, this.store[this.activeIndex]);
            this.consume(this.bufferedData.keys().next().value);
        }
    }

    /**
     * 是否有需要消费的数据
     *
     * @return {boolean} 是否有需要消费的数据
     */
    hasMoreData() {
        if (this.activeIndex >= this.store.length) {
            return false;
        }
        return true;
    }

    /**
     * 消费窗口是否已满
     *
     * @return {boolean} 消费窗口是否已满
     */
    isFull() {
        return this.bufferedData.size + this.processData.size >= this.size;
    }

    /**
     * 添加数据到消费窗口中
     *
     * @param {number} index 数据的序列
     * @param {any} data 数据
     */
    addtobuffer(index, data) {
        if (this.isFull()) {
            return;
        }
        this.bufferedData.set(index, data);
        this.activeIndex++;
    }

    /**
     * 把数据从缓存池中移到运行池中
     *
     * @param {number} index 数据的序列
     */
    consume(index) {
        if (this.consumer) {
            const data = this.bufferedData.get(index);
            this.bufferedData.delete(index);
            this.dataConsume(data, index);
        }
    }

    /**
     * 移动到下一位
     *
     * @param {number} index 已消费的数据序列
     */
    next(index) {
        this.processData.delete(index);
        if (this.hasMoreData()) {
            this.addtobuffer(this.activeIndex, this.store[this.activeIndex]);
        }
        if (!this.bufferedData.keys().next().done) {
            this.bufferedData.keys().next().value && this.consume(this.bufferedData.keys().next().value);
        }
    }

    /**
     * 消费数据
     *
     * @param {any} data 数据
     * @param {number} index 数据的序列
     */
    dataConsume(data, index) {
        this.processData.set(index, data);
        this.consumer(data).then(() => {
            this.next(index);
        }).catch(err => {
            if (this.retryTimes) {
                if (!this.retryMap.has(index)) {
                    this.retryMap.set(index, this.retryTimes);
                }
                if (this.retryMap.get(index) > 0) {
                    this.dataConsume(data, index);
                    this.retryMap.set(index, this.retryTimes - 1);
                }
                else {
                    this.next(index);
                }
            }
            else {
                this.next(index);
            }
        });
    }
};
