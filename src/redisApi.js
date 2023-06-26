
// dotenv.config()
var redis = require("redis");
var Promise = require("bluebird");
const express = require('express');
const fs = require('fs');
const appForUser = express();
var logfmt = require("logfmt");
var url = require('url');
require('dotenv').config();

// 检查环境变量是否为空
if (!process.env.REDISCLOUD_URL) {
    throw new Error("Environment variables for Redis are not set correctly");
}

// 從環境變量獲取Redis的設定並建立連接
var client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
 

Promise.promisifyAll(client); // 在 redis 客戶端對象上使用 promisifyAll



client.on('connect', function() {
    console.log('connected to Redis');
});

client.on("error", function(error) {
    console.error("Error: ", error.message);
});

client.connect();

module.exports.api = async function api() {
    appForUser.get('/api/json/users/by-id/:id/epic002', async (req, res) => {
        try {
        res.set('Access-Control-Allow-Origin', '*');
        
        // 取得參數
        const id = req.params.id;
        
        var data = await client.get(id); // 'data' 是您在 Redis 中存儲資料的 key
        if (data) {
            res.json(JSON.parse(data));
        } else {
            res.status(404).send('Data not found');
        }

        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    });

    // (async () => {
    //     await app.start(process.env.PORT || 8000);
    //     console.log('⚡️ api app started');
    // })();

    let port = process.env.PORT;
    if (port == null || port == "") {
        port = 8000;
    }
        
    appForUser.listen(port, () => {
        console.log('Server API is running on http://localhost:8000');
    });
}

async function testClient() {
    // Connect to Redis，**critical step that is not shown on the tutorial

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
    //  finally {
    //     console.log("Closing the client");
    //     await client.quitAsync();
    // }
};



// api();
// testClient();
