// TO-DO: api的連結可行

const express = require('express');

// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const fs = require('fs');
const http = require('http');
var redis = require("redis");
var Promise = require("bluebird");
var logfmt = require("logfmt");
var url = require('url');


require("dotenv").config();


// 检查环境变量是否为空
if (!process.env.REDISCLOUD_URL) {
    throw new Error("Environment variables for Redis are not set correctly");
}

// Parse the Redis URL from environment variables
// var redisURL = url.parse(process.env.REDISCLOUD_URL);
// Create a new Redis client
var redisclient = redis.createClient({
    url: process.env.REDISCLOUD_URL
});
 
Promise.promisifyAll(redisclient); // 在 redis 客戶端對象上使用 promisifyAll

redisclient.on('connect', function() {
    console.log('connected to Redis');
});

redisclient.on("error", function(error) {
    console.error("Error: ", error.message);
});

redisclient.connect();

// All the room in the world for your code
// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");
const { type } = require('os');

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient( process.env.SLACK_BOT_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
});


// critial important!! use config to set this information on heroku. and use process.env. to get them
const app = new App({
    token: process.env.SLACK_BOT_TOKEN, 
    appToken: process.env.SLACK_APP_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    logLevel: LogLevel.DEBUG,
});

// the object that save all the conversation
// let userSelectedConversation = {};

// what emoji you want to filter
var emojiFilter = [];

const retrieveingTime = new Date();
const retrieveingTimeStamp = retrieveingTime.getTime()/1000;
const retrieveingTimeStampStartDay = retrieveingTimeStamp - 7776000;

// conversation selected was record by ts in this array
// let tsSelected = [];

var channelListId = [];
var channelListIdName =[];
let userList = [];
let currentGifUrl;
let shoutoutedUserId = [];
let newEvent;

module.exports.botReply = async function botReply() {
    // 儲存已觸發功能的貼文 ID
    // const triggeredPosts = {};
    // redisclient.connect();
    // var userListWithSO = await redisclient.keys("*");
    // console.log(userListWithSO);

    // subscribe to 'app_mention' event in your App config
    // need app_mentions:read and chat:write scopes
    app.event('app_mention', async ({ event, context, client, say }) => {
        console.log(event);
        try {
            if (event.user == "U04FCLTTECE") {
                return;
            } else {
            const postId = event.ts; // 使用 thread_ts 如果存在，否則使用 ts
            console.log(postId);
            // redisclient.connect();

            // 檢查貼文是否已觸發過功能
            var allSO = await redisclient.get("U04FCLTTECE");
            // allSO 是代表 SOB 的所有內容
            // var userListWithSO = await redisclient.keys("*"); // checked
            // console.log(userListWithSO);
            allSOObj = JSON.parse(allSO);
            // find if the post id is in the array, if yes, return
            let exisedPostId = allSOObj.epic002.find((shoutout) => shoutout.ts === postId);
            if (exisedPostId) {
                console.log('此貼文已觸發過功能。');
                return;
            } else {
                // post the SOB reply in channel

                const permalink = await client.chat.getPermalink({
                    channel: event.channel,
                    message_ts: event.ts
                }); // checked
                
                console.log(permalink.permalink);
                await fetchCatGif();
    
                // say() sends a message to the channel where the event was triggered
                await say({"blocks": [
                    {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `${event.text} by~~~ <@${event.user}>`
                    }
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "這句話來自這裡 Original message"
                                },
                                // "style": "danger",
                                "value": "click_me_123",
                                "url": `${permalink.permalink}`
                            },
                            {
                                "type": "button",
                                "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "翻看成就背包 See the shoutouts"
                                },
                                "style": "primary",
                                "value": "click_me_123",
                                "url": "https://picchu.io/da0/"
                            },
                            // {
                            //     "type": "button",
                            //     "text": {
                            //     "type": "plain_text",
                            //     "emoji": true,
                            //     "text": "社群功德值"
                            //     },
                            //     "style": "primary",
                            //     "value": "click_me_123",
                            //     "url": "https://g0v-tw.slack.com/archives/C03RAK46BEC"
                            // },
                        ]
                    },
                    {
                        "type": "image",
                        "title": {
                            "type": "plain_text",
                            "text": "image1",
                            "emoji": true
                        },
                        "image_url": currentGifUrl,
                        "alt_text": "image1"
                    },
                ]}); // checked
                // // make the console.log result to JSON file
                // let triggeredPostsJson;
                // triggeredPostsJson = JSON.stringify(triggeredPosts)
            
                // // write the console.log to file
                // fs.writeFile('triggeredPosts.json', triggeredPostsJson, (err) => {
                //     if (err) {
                //         console.error(err);
                //     } else {
                //         console.log('post triggered');
                //     }
                // }); 
                
                // await userListSetting();
                // add this new element without triggering selection() to the 'epic002' array
                newEvent = await modifyShoutOut(event, userList);
                // console.log(newEvent);

                await updateDatabase(event, newEvent, allSOObj);

            }
            }
        }
        catch (error) {
        console.error(error);
        }
        
    });

    (async () => {
        await app.start(process.env.PORT || 3000);
        console.log('⚡️ reply app started');
      })();

};

// get user list in slack work space
async function getUserList() {
    // You probably want to use a database to store any user information ;)
  let userIdInList = {};
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

async function getChannelName() {
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
}

async function userListSetting() {
    // execute the function to get user list before setting user list
    await getUserList();
    console.log(userList);
    // redisclient.connect();

    try {
        let idInList = {};

        var userListWithSO = await redisclient.keys("*");
        console.log(userListWithSO);
        for (let user of userList){
            idInList = user["id"];
            console.log("get user from redis");
            console.log(idInList);
            if (userListWithSO.includes(idInList)) {
                console.log("user is in redis");
                continue;
            } else {
                console.log("user is not in redis");
                await redisclient.set(idInList, JSON.stringify(user));
                console.log("user is now in redis");
            }
        }

        // for (let user of userList){
        //     idInList = user["id"];
        //     let reply = await redisclient.get(idInList);
        //     console.log("get user from redis");
        //     if (reply) {
        //         console.log("user is in redis");
        //         console.log(reply);
        //         continue;
        //     } else {
        //         console.log("user is not in redis");
        //         await redisclient.set(idInList, JSON.stringify(user));
        //         console.log("user is now in redis");
        //     }
        // }
    } catch (error) {
        console.error("Error in userListSetting: ", error);
    }
}

async function fetchCatGif() {
  const url = 'https://api.giphy.com/v1/gifs/random?api_key=UQjFBNNOWp8W2tC2st6Gcvv2u04Wo9Fh&tag=dog&rating=g';

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const gifUrl = data.data.images.fixed_height.url;
    currentGifUrl = gifUrl;
    console.log(gifUrl);

    return gifUrl;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
}

async function modifyShoutOut(data, userList) {
    await userListSetting();
    
    let modifiedShoutOuts;
    console.log(data.text); // data checked 
    // console.log(userListWithSO); // checked
    // redisclient.connect();
    // var userListWithSO = await redisclient.keys("*");
    // console.log(userListWithSO);
    
    let BotIdToSO = data.text.replaceAll("<@U04FCLTTECE>", "Shoutout");

    modifiedShoutOuts = BotIdToSO.replace(/<@.*?>/g , (match) => {
        console.log(match)
        
        // TO-DO: add userList as a parameter
        for (const u of userList) {
            let userId = "<@" + u["id"] + ">";
            
            if (userId === match) {
                let userName = "<" + u["real_name"] + ">"; // problem here
                console.log(userName);
                console.log(u.real_name);
                shoutoutedUserId.push(u["id"]);
                return userName;
            }
        // return match;
        
        } 
    });
    data.text = modifiedShoutOuts;
    console.log(data.text);

    await getChannelName();
    let userObj = userList.find((user) => user.id === data.user);
    // TO-DO: add channelName as a parameter

    let channel = channelListIdName.find((channel) => channel.id === data.channel); 
    // console.log(userObj);
    if (userObj && channel) {
        return {
        ...data,
        user: userObj.real_name,
        channel: channel.name,
        };
    // } else if (userObj && !channel) {
    //     getChannelName();
    //     channel = channelListIdName.find((channel) => channel.id === data.channel); 
    //     return data;
    // } else if (!userObj && channel) {
    //     userListSetting();
    //     var newUserList = await redisclient.keys("*");
    //     userObj = newUserList.find((user) => user.id === data.user);
    //     return data;
    // } else if (!userObj && !channel) {  
    //     userListSetting();
    //     var newUserList = await redisclient.keys("*");
    //     userObj = newUserList.find((user) => user.id === data.user);
    //     getChannelName();
    //     channel = channelListIdName.find((channel) => channel.id === data.channel); 
    //     return data;
    } else {
        return data;
    };
}

async function getKeys() {
    // redisclient.connect();
    // console.log(userListWithSO);

    await getUserList();
    // console.log(userList);

    try {
        let idInList = {};

        for (let user of userList){
            idInList = user["id"];
            let reply = await redisclient.get(idInList);
            let replyObj = JSON.parse(reply);
            console.log("get user from redis");
            if (reply) {
                console.log("user is in redis");
                // console.log(reply);
                // console.log(replyObj.real_name);
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

async function test() {
    // 檢查貼文是否已觸發過功能
    var allSO = await redisclient.get("U04FCLTTECE");
    // console.log(allSO);
    // allSO 是代表 SOB 的所有內容
    var userListWithSO = await redisclient.keys("*"); // checked
    console.log(userListWithSO);
    allSOObj = JSON.parse(allSO);
    // console.log(allSOObj);
    for (SO of allSOObj.epic002) {
        console.log(SO.ts);
    }
}

async function updateDatabase(event, newEvent, allSOObj) {
                    // console.log(allSOJson);
                    await allSOObj.epic002.push({
                        text: `${newEvent.text}`,
                        user: `${newEvent.user}`,
                        ts: `${event.ts}`,
                        channel: `${newEvent.channel}`,
                        // permalink: `${permalink.permalink}`,
                    });
    
                    // Convert the updated object back into a JSON string
                    let updatedSO = JSON.stringify(allSOObj);
    
                    // Store the updated JSON string back in Redis
                    await redisclient.set("U04FCLTTECE", updatedSO);
                    console.log("SOB shoutout updated!");
    
                    for (shoutoutedUser of shoutoutedUserId) {
                        console.log(shoutoutedUser)
                        var userSO = await redisclient.get(shoutoutedUser);
                        console.log(userSO);
                        userSOObj = JSON.parse(userSO);
                        console.log(userSOObj);
    
                        if ("epic002" in userSOObj) {
                            // push messageText into userId, or add a new useId into userSelectedConversation
                            await userSOObj.epic002.push({
                                text: `${newEvent.text}`,
                                user: `${newEvent.user}`,
                                ts: `${event.ts}`,
                                channel: `${newEvent.channel}`,
                                // permalink: `${permalink.permalink}`,
                            });
                            // console.log(newObject)
                            let updateduserSO = JSON.stringify(userSOObj);
                            await redisclient.set(shoutoutedUser, updateduserSO);
                        } else {
                            userSOObj["epic002"] = [];
                            await userSOObj.epic002.push({
                                text: `${newEvent.text}`,
                                user: `${newEvent.user}`,
                                ts: `${event.ts}`,
                                channel: `${newEvent.channel}`,
                                // permalink: `${permalink.permalink}`,
                            });
                            // console.log(newObject)
                            let updateduserSO = JSON.stringify(userSOObj);
                            await redisclient.set(shoutoutedUser, updateduserSO);
                        };
                    }
                    console.log("user shoutout updated!")
}

// botReply();
// userListSetting();
// test();