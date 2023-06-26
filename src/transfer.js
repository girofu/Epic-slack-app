const redis = require('redis');
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

scanAndCopyKeys();
  
