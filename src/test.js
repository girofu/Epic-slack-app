
const express = require('express');

// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const fs = require('fs');
const http = require('http');
const userList = require("../userList.json");
var redis = require("redis");
var Promise = require("bluebird");


require("dotenv").config();


// 检查环境变量是否为空
if (!process.env.REDISCLOUD_URL) {
    throw new Error("Environment variables for Redis are not set correctly");
}

// 從環境變量獲取Redis的設定並建立連接
var redisclient = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
 
Promise.promisifyAll(redisclient); // 在 redis 客戶端對象上使用 promisifyAll

redisclient.on('connect', function() {
    console.log('connected to Redis');
});

redisclient.on("error", function(error) {
    console.error("Error: ", error.message);
});


// critial important!! use config to set this information on heroku. and use process.env. to get them
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// All the room in the world for your code
// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");
const { get } = require('https');

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient( process.env.SLACK_BOT_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
});

// get user list in slack work space
async function getUserList() {
    // You probably want to use a database to store any user information ;)
  let userIdInList = {};
  let userList = [];
  let usersStore = {};
  console.log("getUserList start");

  try {
    // Call the users.list method using the WebClient
    let cursor;
    while(true) {
        const result = await client.users.list({
            limit: 1000,
            cursor: cursor
        });

        saveUsers(result.members);

        if (!result.response_metadata || !result.response_metadata.next_cursor) {
            break;
        }

        cursor = result.response_metadata.next_cursor;
    }
  }
  catch (error) {
    console.error(error);
  }
  
  // Put users into the JavaScript object
  function saveUsers(usersArray) {
    usersArray.forEach(function(user){
      // Key user info on their unique user ID
      userIdInList = user["id"];
      
      // Store the entire user object (you may not need all of the info)
      usersStore[userIdInList] = user["id"];
      userList.push({
        id: user["id"],
        name: user["name"],
        real_name: user["real_name"],
      })
    });
  }
  return userList;
};

async function userListSetting() {
    // execute the function to get user list before setting user list
    await getUserList();
    // console.log(userList);
    redisclient.connect();

    try {
        let idInList = {};

        for (let user of userList){
            idInList = user["id"];
            let reply = await redisclient.get(idInList);
            console.log("get user from redis");
            if (reply) {
                console.log("user is in redis");
                console.log(reply);
                continue;
            } else {
                console.log("user is not in redis");
                await redisclient.set(idInList, JSON.stringify(user));
                console.log("user is now in redis");
            }
        }
    } catch (error) {
        console.error("Error in testClient: ", error);
    }
}

async function testClient() {
    // Connect to Redis，**critical step that is not shown on the tutorial
    await redisclient.connect();

    try {
        console.log("Adding value to the cache");
        await redisclient.set("myKey", "myValue");
        console.log("Reading value back:");
        console.log(await redisclient.get("myKey"));
        console.log("Pinging the cache");
        console.log(await redisclient.ping());
        // await client.flushdbAsync();
    } catch (error) {
        console.error("Error in testClient: ", error);
    }
    //  finally {
    //     console.log("Closing the client");
    //     await client.quitAsync();
    // }
};

// getUserList();
userListSetting();
// testClient();