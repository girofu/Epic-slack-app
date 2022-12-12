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

// what conversation you want to select
var conversationSelected = ["謝謝", "感謝"];

// Find conversation ID using the conversations.list method
async function findConversation(name) {
    try {
        // Call the conversations.list method using the built-in WebClient
        const conversationListResult = await app.client.conversations.list({
          // The token you used to initialize your app
          token: SLACK_BOT_TOKEN
        });

        var channelListId = [];

        for (const channel of conversationListResult.channels) {
          channelListId.push(channel.id);
        }
    }
    catch (error) {
        console.error(error);
    }
      
    // use for loop to channels here
    for (const channelId of channelListId) {
        try {
            // Call the conversations.history method using WebClient
            const conversationHistoryResult = await client.conversations.history({
                channel: channelId
            });

            for (const messages of conversationHistoryResult.messages) {
                
                // retrieve text
                var messagesText = messages.text;

                // filter the conversation with positive compliment
                for (var i = 0; i < conversationSelected.length; i += 1) {
                    var isPositive = messagesText.includes(conversationSelected[i]);
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
                                userId = messages.blocks[0].elements[0].elements[0].user_id;
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
    console.log(userSelectedConversation);

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

    server.listen(2000, () => {
    console.log('伺服器已啟動，網址為http://localhost:2000/');
    });
}

// Find conversation with a specified channel `name`
findConversation();


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();