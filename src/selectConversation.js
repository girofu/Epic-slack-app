
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// import {getUserList} from "./getUserList";
// import {modifyEpic} from "./modifyEpic";
// import {epicWriteIn} from "./epicWriteIn";
dotenv.config()
const express = require('express');

// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const fs = require('fs');
const http = require('http');
const userAddressAndId = require("../userAddressAndId.json");
const userList = require("../userList.json");
// const userSelectedConversation = require("../userSelectedConversationObject.json");
const tsSelected = require("../tsSelectedJson.json");
const userSelectedConversation002 = require("../userSelectedConversationObject002.json");
require('dotenv').config();


// critial important!! use config to set this information on heroku. and use process.env. to get them
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// All the room in the world for your code
// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient( process.env.SLACK_BOT_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
});


// the object that save all the conversation
// let userSelectedConversation = {};


// what conversation you want to filter
var wordFilter = ["謝謝", "感謝", "感恩", "太棒", "讚", "thank you", "thanks"];

// what emoji you want to filter
var emojiFilter = [];

const retrieveingTime = new Date();
const retrieveingTimeStamp = retrieveingTime.getTime()/1000;
const retrieveingTimeStampStartDay = retrieveingTimeStamp - 604800;

// conversation selected was record by ts in this array
// let tsSelected = [];

var channelListId = [];
var channelListIdName =[];

// Find conversation ID using the conversations.list method
export async function selectConversation(name) {
    // let userSelectedConversation002 = {};
    console.log("selectConversation start");
    try {
        let cursor;
        while (true) {
            // Call the conversations.list method using the built-in WebClient
            const conversationListResult = await app.client.conversations.list({
                // The token you used to initialize your app
                token: process.env.SLACK_BOT_TOKEN,
                // set the channel amount search limit 
                limit: 1000,
                cursor: cursor
            });

            for (const channel of conversationListResult.channels) {
                if (channel.is_member) {
                    channelListId.push(channel.id);
                    channelListIdName.push({id: channel.id, name:channel.name});
                    // console.log(channel.id);
                }
            }
            if (!conversationListResult.response_metadata || !conversationListResult.response_metadata.next_cursor) {
                break;
            }
    
            cursor = conversationListResult.response_metadata.next_cursor;
        }   

    }
    catch (error) {
        console.error(error);
    }
      
    // filter channels conversation here
    for (const channelId of channelListId) {
        try {
            let cursor;
            while (true) {
                // Call the conversations.history method using WebClient
                const conversationHistoryResult = await client.conversations.history({
                    channel: channelId,
                    inclusive: true,
                    // test timestamp here
                    latest: retrieveingTimeStamp,

                    // 20221023 da0 anniversary: 1666454091.198649
                    oldest: retrieveingTimeStampStartDay,
                    limit: 1000,
                    cursor: cursor
                });
                // console.log(conversationHistoryResult);

                
                // for loop conversations here
                for (const messages of conversationHistoryResult.messages) {

                    // retrieve text
                    var messagesText = messages.text;
                    let isConversationSelected = false;
                    
                    if (!tsSelected.includes(messages.ts)) {
                        // record selected messages by ts 
                        tsSelected.push(messages.ts);
                        // filter the conversation with positive compliment
                        // for (var i = 0; i < wordFilter.length; i += 1) {
                        //     if (!isConversationSelected) {
                        //         var isPositive = messagesText.includes(wordFilter[i]);
                        //         if (isPositive) {
                        //             let patternResult;  
                        //             let pattern = /<@/;

                        //             // see if the @someone happen in the text
                        //             patternResult = pattern.test(messagesText);
                        //             if (patternResult) {
                        //                 if (messages.subtype != "channel_join") { 
                        //                     let userId = '';
                        //                     let speakUser = '';
                        //                     // save the @someone as userId 
                        //                     let n;
                        //                     // console.log(messages.blocks[0].elements[0].elements);
                        //                     // console.log(messages.blocks[0].elements[0].elements.length);
                        //                     // console.log(messages.reactions[0].name)
                        //                     let userSelected = [];
                        //                     let isUserSelected;

                        //                     for (n = 0; messages.blocks[0].elements[0].elements.length > n ; n += 1) {
                        //                         // console.log(messages.blocks[0].elements[0].elements[n].user_id);
                        //                         userId = messages.blocks[0].elements[0].elements[n].user_id;
                        //                         speakUser = messages.user;
                        //                         isUserSelected = userSelected.includes(userId);
                                            
                        //                         if (!isUserSelected) {
                        //                             if (userId != speakUser) {
                        //                                 if (userId != undefined) {
                                                            
                        //                                     if (userSelectedConversation.hasOwnProperty(userId)) {
                        //                                         // push messageText into userId, or add a new useId into userSelectedConversation
                        //                                         let newObject = {};
                        //                                         newObject = {text: messages.text, user: messages.user, ts: messages.ts, channel: channelId};
                        //                                         userSelectedConversation[userId].push(newObject); 
                        //                                     } else {
                        //                                         let newObject = {};
                        //                                         newObject = {text: messages.text, user: messages.user, ts: messages.ts, channel: channelId};
                        //                                         userSelectedConversation[userId].push(newObject); 
                        //                                     };
                        //                                     isConversationSelected = true;
                        //                                     userSelected.push(userId);
                        //                                 }
                        //                             }
                        //                         }
                        //                     }
                        //                 }
                        //             } 
                        //         }
                        //     } 
                        // } 
                        // filter002 function
                        let patternResult;  
                        let pattern = /<@U04FCLTTECE>/;

                        // see if the @someone happen in the text
                        patternResult = pattern.test(messagesText);
                        if (patternResult) {
                            if (messages.subtype != "channel_join") { 
                                let userId = '';
                                let speakUser = '';
                                // save the @someone as userId 
                                let userSelected = [];
                                let isUserSelected;

                                for (const user of userList) {
                                userId = user.id;
                                speakUser = messages.user;
                                isUserSelected = userSelected.includes(userId);
                                
                                    if (!isUserSelected) {
                                        if (userId != speakUser && speakUser != "U04FCLTTECE") {
                                            if (messagesText.includes(userId)) {
                                                
                                                if (userSelectedConversation002.hasOwnProperty(userId)) {
                                                    // add message user id and messageTest together as an object into userSelectedConversation002
                                                    let newObject = {};
                                                    newObject = {text: messages.text, user: messages.user, ts: messages.ts, channel: channelId};
                                                    userSelectedConversation002[userId].push(newObject);
                                                } else {
                                                    userSelectedConversation002[userId] = [];
                                                    let newObject = {};
                                                    newObject = {text: messages.text, user: messages.user, ts: messages.ts, channel: channelId};
                                                    userSelectedConversation002[userId].push(newObject);
                                                };
                                                userSelected.push(userId);
                                            }
                                        }
                                    }
                                }
                            } 
                        }
                    }
                    // thread conversation retrieving
                    let threadTs;
                    let patternResult;  
                    let pattern = /<@U04FCLTTECE>/;
                    
                    if (messages.thread_ts !== undefined) {
                        threadTs = messages.thread_ts;
                        try {
                            const threadConversation = await client.conversations.replies({
                                channel: channelId,
                                ts: threadTs,
                                limit: 1000
                            });
                            for (const conversation of threadConversation.messages) {
                                if (!tsSelected.includes(conversation.ts)) {
                                    let threadPatternResult;
                                    let conversationText = conversation.text;
                                    threadPatternResult = pattern.test(conversation.text);
                                    // record selected messages by ts 

                                    if (threadPatternResult) {
                                        let userId = '';
                                        let speakUser = '';
                                        // save the @someone as userId 
                                        let userSelected = [];
                                        let isUserSelected;
                                        

                                        for (const user of userList) {
                                        userId = user.id;
                                        speakUser = conversation.user;
                                        isUserSelected = userSelected.includes(userId);
                                            if (!isUserSelected) {
                                                if (userId != speakUser && speakUser != "U04FCLTTECE") {
                                                    if (conversationText.includes(userId)) {
                                                        if (userSelectedConversation002.hasOwnProperty(userId)) {
                                                            // push messageText into userId, or add a new useId into userSelectedConversation
                                                            let newObject = {};
                                                            newObject = {text: conversation.text, user: conversation.user, ts: conversation.ts, channel: channelId};
                                                            userSelectedConversation002[userId].push(newObject); 
                                                            // console.log(newObject)
                                                        } else {
                                                            let newObject = {};
                                                            newObject = {text: conversation.text, user: conversation.user, ts: conversation.ts, channel: channelId};
                                                            userSelectedConversation002[userId] = [];
                                                            userSelectedConversation002[userId].push(newObject);
                                                            // console.log(newObject)
                                                        };
                                                        userSelected.push(userId);
                                                        tsSelected.push(conversation.ts);
                                                        // console.log(userSelectedConversation002);
                                                        console.log(userSelectedConversation002[userId]);
 
                                                        
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
                    
                }
                if (!conversationHistoryResult.response_metadata || !conversationHistoryResult.response_metadata.next_cursor) {
                    break;
                }
                cursor = conversationHistoryResult.response_metadata.next_cursor;
            }    
        }
        catch (error) {
            console.error(error);
        }
    }

    // console.log(userSelectedConversation002);
    

    // for (const user of userAddressAndId) {
    //     let userIdFromUserAddress = user[3];
    //     const userIdFromUserList = userList.find(u => u.id === userIdFromUserAddress);
    // }

    

    // make the console.log result to JSON file
    // let userSelectedConversationJson;
    // userSelectedConversationJson = JSON.stringify(userSelectedConversation)

    // // write the console.log to file
    // fs.writeFile('userSelectedConversationObject.json', userSelectedConversationJson, (err) => {
    //     if (err) {
    //         console.error(err);
    //     } else {
    //         console.log('數據已成功寫入檔案');
    //     }
    // });  

    // make the console.log result to JSON file
    let userSelectedConversationJson002;
    userSelectedConversationJson002 = JSON.stringify(userSelectedConversation002)

    // write the console.log to file
    fs.writeFile('userSelectedConversationObject002.json', userSelectedConversationJson002, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('userSelectedConversationJson002已成功寫入檔案');
        }
    });

    // make the console.log result to JSON file
    let tsSelectedJson;
    tsSelectedJson = JSON.stringify(tsSelected)

    // write the console.log to file
    fs.writeFile('tsSelectedJson.json', tsSelectedJson, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('tsSelectedJson已成功寫入檔案');
        }
    });

    let channelNameJson;
    channelNameJson = JSON.stringify(channelListIdName)

    // write the console.log to file
    fs.writeFile('channelName.json', channelNameJson, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('channelNameJson已成功寫入檔案');
        }
    });


}