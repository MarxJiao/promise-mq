# promise-mq

一个简单的 js 消息队列

## use

安装

```
npm i promise-mq
```

使用

```
const PromiseMq = require('promise-mq');

const comsumer = function (data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(data);
            resolve(data);
        }, 10000)
    })
}

const options = {
    size: 2,
}

const mq = new PromiseMq(comsumer, options);

const testData = [0, 1, 2, 3, 5, 6, 7];

for (let data of testData) {
    mq.addData(data);
}

```

会每2个数据间隔 10s 输出:

```
0
1
2
3
5
6
7
```

## 说明

PromiseMq 是个类, 需要通过 new PromiseMq(consumer, options) 来使用

### 参数

- **consumer**: 消耗数据的函数，需要返回 Promise。必填参数。
- **options**: 配置，可选参数。
    - options.size: 窗口大小，默认为4，会有4个 consumer 同时执行。
    - retryTimes: consumer reject 后的重试次数，默认 1，重试 1 次。小于等于 0 不重试。

### 方法

- addData: 往队列点添加数据。