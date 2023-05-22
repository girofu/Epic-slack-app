var redis = require("redis");
var Promise = require("bluebird");
var fs = require('fs');

require("dotenv").config();


// 检查环境变量是否为空
if (!process.env.REDISPORT || !process.env.REDISHOSTNAME || !process.env.REDISKEY) {
    throw new Error("Environment variables for Redis are not set correctly");
}

// 從環境變量獲取Redis的設定並建立連接
const client = redis.createClient({
    url: `rediss://${process.env.REDISHOSTNAME}:${process.env.REDISPORT}`,
    password: process.env.REDISKEY
});
 

Promise.promisifyAll(client); // 在 redis 客戶端對象上使用 promisifyAll



client.on('connect', function() {
    console.log('connected to Redis');
});

client.on("error", function(error) {
    console.error("Error: ", error.message);
});

// 讀取 JSON 文件
function loadFiles() {
    fs.readFile('userListWithEpic.json', 'utf8', function (err, data) {
        if (err) throw err;
        var obj = JSON.parse(data);

        // 將資料存入 Redis
        // for (let item of obj) {
        //     let id = item['id'];
        //     for (let key in item) {
        //         let value = item[key];
        //         console.log(`Saving ${id}, ${key}, ${value} to Redis`);
        //         client.setAsync(id, key, value);
        //     }
        // }
        for (let item of obj) {
            let id = item['id'];
            console.log(`Saving ${id} to Redis`);
            client.set(id, JSON.stringify(item));
        }

        // 存入完成的提示
        console.log("Data saved to Redis");

        // 讀取其中一筆資料
        (async () => {
            // 開始讀取
            console.log("Reading U04FCLTTECE from Redis");
            let result = await client.get("U04FCLTTECE");
            console.log(JSON.parse(result));
            // console.log(result);
        })();

        console.log("Before the async call");

        // // 讀取 Redis 中的資料
        // (async () => {
        //     for (let item of obj) {
        //         let id = item['id'];
        //         console.log(`Reading ${id} from Redis`);
        //         let result = await client.get(id);
        //         console.log(result);
        //     }
        // })();
    });
}

async function testClient() {
    // Connect to Redis，**critical step that is not shown on the tutorial
    await client.connect();

    try {
        console.log("Adding value to the cache");
        await client.set("myKey", "myValue");
        console.log("Reading value back:");
        console.log(await client.get("myKey"));
        console.log("Pinging the cache");
        console.log(await client.ping());
        // await client.flushdbAsync();
    } catch (error) {
        console.error("Error in testClient: ", error);
    }
     finally {
        console.log("Closing the client");
        await client.quitAsync();
    }
};

testClient();
loadFiles();

console.log("REDISPORT: ", process.env.REDISPORT);
console.log("REDISHOSTNAME: ", process.env.REDISHOSTNAME);
console.log("REDISKEY: ", process.env.REDISKEY);





