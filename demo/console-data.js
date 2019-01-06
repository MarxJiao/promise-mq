/**
 * @file 打印数据
 * @author Marx
 */

const PromiseMq = require('../src/index');

const comsumer = function (data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(data);
            resolve(data);
        }, 10000);
    });
};

const options = {
    size: 2
};

const mq = new PromiseMq(comsumer, options);

const testData = [0, 1, 2, 3, 5, 6, 7];

for (let data of testData) {
    mq.addData(data);
}
