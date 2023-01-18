// import { SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } from "./constants";

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
const express = require('express');

// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const fs = require('fs');
const http = require('http');
const userAddressAndId = require("../userAddressAndId.json");
const userList = require("../userList.json");
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
let userSelectedConversation = {};
let userSelectedConversation002 = {};

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
          token: process.env.SLACK_BOT_TOKEN,
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
        // console.log(channelListId);
        // console.log(retrieveingTime);
        // console.log(retrieveingTimeStamp);
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
                                    // console.log(messages.reactions[0].name)
                                    let userSelected = [];
                                    let isUserSelected;

                                    for (n = 0; messages.blocks[0].elements[0].elements.length > n ; n += 1) {
                                        // console.log(messages.blocks[0].elements[0].elements[n].user_id);
                                        userId = messages.blocks[0].elements[0].elements[n].user_id;
                                        speakUser = messages.user;
                                        isUserSelected = userSelected.includes(userId);
                                    
                                        if (!isUserSelected) {
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
                                                    userSelected.push(userId);
                                                }
                                            }
                                        }
                                    }
                                }
                            } 
                        }
                    } 
                } 
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
                                if (userId != speakUser) {
                                    if (messagesText.includes(userId)) {
                                        
                                        if (userSelectedConversation002.hasOwnProperty(userId)) {
                                            // push messageText into userId, or add a new useId into userSelectedConversation
                                            userSelectedConversation002[userId].push(messages.text); 
                                        } else {
                                            userSelectedConversation002[userId] = [];
                                            userSelectedConversation002[userId].push(messages.text);
                                        };
                                        userSelected.push(userId);
                                    }
                                }
                            }
                        }
                    } 
                }

                // thread conversation retrieving
                let threadTs;
                if (messages.thread_ts !== undefined) {
                    threadTs = messages.thread_ts;
                    try {
                        const threadConversation = await client.conversations.replies({
                            channel: channelId,
                            ts: threadTs,
                            limit: 1000
                        });
                        for (const conversation of threadConversation.messages) {
                            let threadPatternResult;
                            let conversationText = conversation.text;
                            threadPatternResult = pattern.test(conversation.text);
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
                                        if (userId != speakUser) {
                                            if (conversationText.includes(userId)) {
                                                if (userSelectedConversation002.hasOwnProperty(userId)) {
                                                    // push messageText into userId, or add a new useId into userSelectedConversation
                                                    userSelectedConversation002[userId].push(conversationText); 
                                                } else {
                                                    userSelectedConversation002[userId] = [];
                                                    userSelectedConversation002[userId].push(conversationText);
                                                };
                                                userSelected.push(userId);
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
        }
        catch (error) {
            console.error(error);
        }
    }

    // console.log(userSelectedConversation);

    let userListWithRawEpic = userList;
    for (const user of userListWithRawEpic) {
        // console.log(user);
        // console.log(user.id);
        let users = user.id;
        // console.log(userSelectedConversation[users]);
        let userEpic = userSelectedConversation[users];
        let userEpic002 = userSelectedConversation002[users];
        user["epic"] = userEpic;
        user["epic002"] = userEpic002
        // console.log(userList);
        const UserIdFromGoogleSheet = userAddressAndId.find(u => u[3] === users);
        if (UserIdFromGoogleSheet != undefined) {
            user["address"] = UserIdFromGoogleSheet[4].toLowerCase();
        };
    }
    

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
            console.log('數據已成功寫入檔案');
        }
    });

    // make the console.log result to JSON file
    let userListJson;
    userListJson = JSON.stringify(userListWithRawEpic)

    // write the console.log to file
    fs.writeFile('userListWithRawEpic.json', userListJson, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('數據已成功寫入檔案');
        }
    }); 
}





let userIdInList = {};
// let userList = [];

// get user list in slack work space
async function getUserList() {
    // You probably want to use a database to store any user information ;)
let usersStore = {};

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
    // console.log(usersStore); 
  }

  // make the console.log result to JSON file
  let userListJson;
  userListJson = JSON.stringify(userList)

  // write the console.log to file
  fs.writeFile('userList.json', userListJson, (err) => {
      if (err) {
          console.error(err);
      } else {
          console.log('數據已成功寫入檔案');
      }
  }); 
};


// upload the file
// function printEpics() {
//     // upload the file
//     const filePath = 'userSelectedConversationObject.json';

//     const server = http.createServer((req, res) => {
//     fs.readFile(filePath, (err, data) => {
//         if (err) {
//         res.writeHead(404);
//         res.end(JSON.stringify(err));
//         return;
//         }

//         res.writeHead(200, {
//         'Content-Type': 'application/json',
//         'Content-Length': data.length,
//         });
//         res.end(data);
//     });
//     });

//     server.listen(process.env.port || 2000, () => {
//     console.log('伺服器已啟動，網址為http://localhost:2000/');
//     });
// }

async function asyncFunc() {
    // await getUserList();
    await findConversation();
    // await printEpics();
    
    
};

asyncFunc();

// use server to upload userList
const appForUser = express();

function serverSetting() {
    appForUser.get('/api/json/users/:name/id', (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        // 取得json檔的資料
        const data = require('../userListWithEpic.json');
        // 取得參數
        const name = req.params.name;
        // 尋找使用者
        const user = data.find(user => user.name === name);
        // 將資料回傳給使用者
        if (user) {
            res.json({ id: user.id });
            } else {
            // 否則回傳錯誤訊息
            res.status(404).json({ error: 'User not found' });
            }
    });

    // appForUser.get('/api/json/users/:name/epic', (req, res) => {
    //     // 取得json檔的資料
    //     const data = require('./userList.json');
    //     // 取得參數
    //     const name = req.params.name;
    //     // 尋找使用者
    //     const user = data.find(user => user.name === name);
    //     // 將資料回傳給使用者
    //     if (user) {
    //         res.json({ epic: user.epic });
    //         } else {
    //         // 否則回傳錯誤訊息
    //         res.status(404).json({ error: 'User not found' });
    //         }
    // });

    // appForUser.get('/api/json/users/:id/name', (req, res) => {
    //     // 取得json檔的資料
    //     const data = require('./userList.json');
    //     // 取得參數
    //     const id = req.params.id;
    //     // 尋找使用者
    //     const user = data.find(user => user.id === id);
    //     // 將資料回傳給使用者
    //     if (user) {
    //         res.json({ name: user.name });
    //         } else {
    //         // 否則回傳錯誤訊息
    //         res.status(404).json({ error: 'User not found' });
    //         }
    // });

    // appForUser.get('/api/json/users/:id/epic', (req, res) => {
    //     // 取得json檔的資料
    //     const data = require('./userList.json');
    //     // 取得參數
    //     const id = req.params.id;
    //     // 尋找使用者
    //     const user = data.find(user => user.id === id);
    //     // 將資料回傳給使用者
    //     if (user) {
    //         res.json({ epic: user.epic });
    //         } else {
    //         // 否則回傳錯誤訊息
    //         res.status(404).json({ error: 'User not found' });
    //         }
    // });

    // appForUser.get('/api/json/users/:id/address', (req, res) => {
    //     // 取得json檔的資料
    //     const data = require('./userList.json');
    //     // 取得參數
    //     const id = req.params.id;
    //     // 尋找使用者
    //     const user = data.find(user => user.id === id);
    //     // 將資料回傳給使用者
    //     if (user) {
    //         res.json({ address: user.address });
    //         } else {
    //         // 否則回傳錯誤訊息
    //         res.status(404).json({ error: 'User not found' });
    //         }
    // });

    appForUser.get('/api/json/users/:address/name', (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        // 取得json檔的資料
        const data = require('../userListWithEpic.json');
        // 取得參數
        const address = req.params.address;
        // 尋找使用者
        const user = data.find(user => user.address === address);
        // 將資料回傳給使用者
        if (user) {
            res.json({ name: user.name });
            } else {
            // 否則回傳錯誤訊息
            res.status(404).json({ error: 'User not found' });
            }
    });

    appForUser.get('/api/json/users/:address/real_name', (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        // 取得json檔的資料
        const data = require('../userListWithEpic.json');
        // 取得參數
        const address = req.params.address;
        // 尋找使用者
        const user = data.find(user => user.address === address);
        // 將資料回傳給使用者
        if (user) {
            res.json({ real_name: user.real_name });
            } else {
            // 否則回傳錯誤訊息
            res.status(404).json({ error: 'User not found' });
            }
    });

    appForUser.get('/api/json/users/:address/epic', (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        // 取得json檔的資料
        const data = require('../userListWithEpic.json');
        // 取得參數
        const address = req.params.address;
        // 尋找使用者
        const user = data.find(user => user.address === address);
        // 將資料回傳給使用者
        if (user) {
            res.json({ epic: user.epic });
            } else {
            // 否則回傳錯誤訊息
            res.status(404).json({ error: 'User not found' });
            }
    });

    appForUser.get('/api/json/users/:address/epic002', (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        // 取得json檔的資料
        const data = require('../userListWithEpic.json');
        // 取得參數
        const address = req.params.address;
        // 尋找使用者
        const user = data.find(user => user.address === address);
        // 將資料回傳給使用者
        if (user) {
            res.json({ epic002: user.epic002 });
            } else {
            // 否則回傳錯誤訊息
            res.status(404).json({ error: 'User not found' });
            }
    });

    let port = process.env.PORT;
    if (port == null || port == "") {
        port = 8000;
    }
        
    appForUser.listen(port, () => {
        console.log("資料上傳");
    });
};

// serverSetting();


// (async () => {
//   // Start your app
//   await app.start(process.env.PORT || 3000);

//   console.log('⚡️ Bolt app is running!');
// })();