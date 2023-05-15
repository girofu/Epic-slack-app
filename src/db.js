
var Promise = require("bluebird");
var redis = require("redis");

require("dotenv").config();


// 從環境變量獲取Redis的設定並建立連接
// Promise.promisifyAll(redis);

// const client = redis.createClient(
//    process.env.REDISPORT,
//    process.env.REDISHOSTNAME,
//    {
//       password: process.env.REDISKEY,
//       tls: { servername: process.env.REDISHOSTNAME }
//    }
// );

// const client = redis.createClient({
//     port: process.env.REDISPORT,
//     host: process.env.REDISHOSTNAME,
//     password: process.env.REDISKEY,
//     tls: { servername: process.env.REDISHOSTNAME }
//  });


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


// // 你的JSON資料
// const data = [
//     {"id":"USLACKBOT","name":"slackbot","real_name":"Slackbot"},
//     {"id":"U02G2SXKR","name":"yhsiang","real_name":"yhsiang"},
//     {"id":"U02G2US2Z","name":"clkao","real_name":"clkao"},
//     {"id":"U02G30WJT","name":"gugod","real_name":"gugod"}
// ];

// // 將資料存入Redis
// for (let item of data) {
//     let id = item['id'];
//     for (let key in item) {
//         let value = item[key];
//         client.hsetAsync(id, key, value);
//     }
// }

// // 讀取Redis中的資料
// (async () => {
//     for (let item of data) {
//         let id = item['id'];
//         let result = await client.hgetallAsync(id);
//         console.log(result);
//     }
// })();

// (async () => {
//     console.log("Adding value to the cache");
//     await client.setAsync("myKey", "myValue");
//     console.log("Reading value back:");
//     console.log(await client.getAsync("myKey"));
//     console.log("Pinging the cache");
//     console.log(await client.pingAsync());
//     await client.flushdbAsync();
//     await client.quitAsync();
//   })();

// client.on("error", function(error) {
//     console.error("Error: ", error);
// });

// async function testClient() {
//     try {
//         console.log("Adding value to the cache");
//         await client.setAsync("myKey", "myValue");
//         console.log("Reading value back:");
//         console.log(await client.getAsync("myKey"));
//         console.log("Pinging the cache");
//         console.log(await client.pingAsync());
//         await client.flushdbAsync();
//     } catch (error) {
//         console.error("Error: ", error);
//     }
//      finally {
//         console.log("Closing the client");
//         await client.quitAsync();
//     }
// };

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

console.log("REDISPORT: ", process.env.REDISPORT);
console.log("REDISHOSTNAME: ", process.env.REDISHOSTNAME);
console.log("REDISKEY: ", process.env.REDISKEY);





