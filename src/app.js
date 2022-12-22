import { SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } from "./constants";

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import express from 'express'

// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const fs = require('fs');
const http = require('http');
require('dotenv').config();


const app = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// All the room in the world for your code
// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient( SLACK_BOT_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
});


// the object that save all the conversation
let userSelectedConversation = {};

// what conversation you want to filter
var wordFilter = ["謝謝", "感謝", "感恩", "太棒", "讚", "thank you", "thanks"];

// what emoji you want to filter
var emojiFilter = [];

const retrieveingTime = new Date();
const retrieveingTimeStamp = retrieveingTime.setDate();


// Find conversation ID using the conversations.list method
async function findConversation(name) {
    try {
        // Call the conversations.list method using the built-in WebClient
        const conversationListResult = await app.client.conversations.list({
          // The token you used to initialize your app
          token: SLACK_BOT_TOKEN,
          // set the channel amount search limit 
          limit: 1000
        });

        var channelListId = [];

        for (const channel of conversationListResult.channels) {
            if (channel.is_member) {
                channelListId.push(channel.id);
                // console.log(channel.id);
            }
        }
        // console.log(conversationListResult);
        console.log(channelListId);
        console.log(retrieveingTime);
        console.log(retrieveingTimeStamp);
    }
    catch (error) {
        console.error(error);
    }
      
    // filter channels conversation here
    for (const channelId of channelListId) {
        try {
            // Call the conversations.history method using WebClient
            const conversationHistoryResult = await client.conversations.history({
                channel: channelId,
                inclusive: true,
                // test timestamp here
                latest: retrieveingTimeStamp,
                limit: 1000
            });
            // console.log(conversationHistoryResult);

            // for loop conversations here
            for (const messages of conversationHistoryResult.messages) {
                
                // retrieve text
                var messagesText = messages.text;
                let isConversationSelected = false;
                // filter the conversation with positive compliment
                for (var i = 0; i < wordFilter.length; i += 1) {
                    if (!isConversationSelected) {
                    var isPositive = messagesText.includes(wordFilter[i]);
                    if (isPositive) {
                        let patternResult;  
                        let pattern = /<@/;

                        // see if the @someone happen in the text
                        patternResult = pattern.test(messagesText);
                        if (patternResult) {
                            if (messages.subtype != "channel_join") { 
                                let userId = '';
                                let speakUser = '';
                                // save the @someone as userId 
                                let n;
                                // console.log(messages.blocks[0].elements[0].elements);
                                // console.log(messages.blocks[0].elements[0].elements.length);
                                console.log(messages.reactions[0].name)
                                
                                for (n = 0; messages.blocks[0].elements[0].elements.length > n ; n += 1) {
                                // console.log(messages.blocks[0].elements[0].elements[n].user_id);
                                userId = messages.blocks[0].elements[0].elements[n].user_id;
                                speakUser = messages.user;
                                

                                if (userId != speakUser) {
                                    if (userId != undefined) {
                                        if (userSelectedConversation.hasOwnProperty(userId)) {
                                            // push messageText into userId, or add a new useId into userSelectedConversation
                                            userSelectedConversation[userId].push(messages.text); 
                                        } else {
                                            userSelectedConversation[userId] = [];
                                            userSelectedConversation[userId].push(messages.text);
                                        };
                                        isConversationSelected = true;
                                    }
                                }
                                }
                            }
                        } 
                    }
                    } 
                } 
            }
            
        }
        catch (error) {
        console.error(error);
        }
    }
    // console.log(userSelectedConversation);

    // make the console.log result to JSON file
    let userSelectedConversationJson;
    userSelectedConversationJson = JSON.stringify(userSelectedConversation)

    // write the console.log to file
    fs.writeFile('userSelectedConversationObject.json', userSelectedConversationJson, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('數據已成功寫入檔案');
        }
    });  

    // upload the file
    const filePath = 'userSelectedConversationObject.json';

    const server = http.createServer((req, res) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
        }

        res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        });
        res.end(data);
    });
    });

    server.listen(process.env.port || 2000, () => {
    console.log('伺服器已啟動，網址為http://localhost:2000/');
    });
}

// Find conversation with a specified channel `name`
// findConversation();



async function getUserList() {
    // You probably want to use a database to store any user information ;)
let usersStore = {};

  try {
    // Call the users.list method using the WebClient
    const result = await client.users.list();

    saveUsers(result.members);
  }
  catch (error) {
    console.error(error);
  }
  

  // Put users into the JavaScript object
  function saveUsers(usersArray) {
    let userIdInList = {};
    let userList = [];
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
    // console.log(usersStore); 
    console.log(userList)
  }
};

getUserList();


// app.get('/api/json/:name', (req, res) => {
//     // 取得json檔的資料
//     const data = require('..userSelectedConversationObject.json');
//     // 取得參數
//     const name = req.params.name;
//     // 尋找使用者
//     const user = data.find(user => user.name === name);
//     // 將資料回傳給使用者
//     res.json(user);
//     });

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();