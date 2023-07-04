const redis = require('redis');
const fs = require("fs");
var Promise = require('bluebird'); // add this
require('dotenv').config();

// 建立連接至來源及目標資料庫
const sourceClient = redis.createClient({
    host: 'localhost', 
    port: 6379
});

const targetClient = redis.createClient({ 
    url: process.env.REDISCLOUD_URL
});

// promisify redis client
Promise.promisifyAll(sourceClient);

sourceClient.on('connect', function() {
    console.log('connected to sourceClient');
});

sourceClient.connect();

// promisify redis client
Promise.promisifyAll(targetClient);

targetClient.on('connect', function() {
    console.log('connected to targetClient');
});

targetClient.connect();

let cursor = '0';

function scanAndCopyKeys() {
  sourceClient.scan(cursor, 'MATCH', '*', 'COUNT', '100', function(err, reply) {
    if (err) throw err;
    console.log("done");

    // reply is an array where reply[0] is the new cursor and reply[1] is the array of keys
    cursor = reply[0];
    const keys = reply[1];

    keys.forEach(key => {
      sourceClient.dump(key, (err, value) => {
        if (err) throw err;

        targetClient.del(key, (err, delResult) => {
          if (err) throw err;

          targetClient.restore(key, 0, value, (err, restoreResult) => {
            if (err) throw err;
          });
        });
      });
    });

    // if cursor == '0', it means the scan is complete
    if (cursor !== '0') {
      scanAndCopyKeys();
    } else {
      // You may want to close the connection here.
      console.log('Finished!');
    }
  });
}

// 讀取 JSON 文件
function loadFiles() {
    fs.readFile('/Users/fuchangwei/Projects/Slack-app/epic-slack-app-g0v-001/backup20230705/userListWithEpic.json', 'utf8', function (err, data) {
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
            targetClient.set(id, JSON.stringify(item));
        }

        // 存入完成的提示
        console.log("Data saved to Redis");

        // 讀取其中一筆資料
        (async () => {
            // 開始讀取
            console.log("Reading U04FCLTTECE from Redis");
            let result = await targetClient.get("U04FCLTTECE");
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

loadFiles();
// scanAndCopyKeys();
  
