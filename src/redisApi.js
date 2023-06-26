
// dotenv.config()
var redis = require("redis");
const express = require('express');
var Promise = require('bluebird'); // add this
var logfmt = require("logfmt");
var url = require('url');
require('dotenv').config();


// Parse the Redis URL from environment variables
var redisURL = url.parse(process.env.REDISCLOUD_URL);
// Create a new Redis client
var client = redis.createClient({
    url: process.env.REDISCLOUD_URL
});

// promisify redis client
Promise.promisifyAll(client);

client.on('connect', function() {
    console.log('connected to Redis');
});

client.connect();

// Authenticate with the Redis server
// Authenticate with the Redis server
// if (redisURL.auth) {
//     var authParts = redisURL.auth.split(":");
//     if (authParts.length > 1) {
//       client.auth(authParts[1]);
//     }
//   }
  

const appForUser = express();

// Set up the view engine
appForUser.engine('html', require('ejs').renderFile);

appForUser.get('/', function(req, res) {
  res.render('index.html');
});

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

    var port = Number(process.env.PORT || 8000);
    appForUser.listen(port, function() {
      console.log("Listening on " + port);
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
