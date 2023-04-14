import * as dotenv from 'dotenv'
require('dotenv').config();
dotenv.config()

let messageBlocksJson = require('../messageBlocks.json');

const fs = require('fs');

// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
});


const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN, 
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  logLevel: LogLevel.DEBUG,
});

const express = require('express');

// use server to upload userList
const appForUser = express();

const schedule = require('node-schedule');

const messageBlocks = [];

let currentGifUrl;

function serverSetting() {
    appForUser.get('/api/json/users/:name/id', (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        // 清除快取並重新載入檔案
        delete require.cache[require.resolve('../userListWithEpic.json')];
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

    appForUser.get('/api/json/users/by-address/:address/name', (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        // 清除快取並重新載入檔案
        delete require.cache[require.resolve('../userListWithEpic.json')];
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

    appForUser.get('/api/json/users/by-address/:address/real_name', (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        // 清除快取並重新載入檔案
        delete require.cache[require.resolve('../userListWithEpic.json')];
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

    appForUser.get('/api/json/users/by-address/:address/epic', (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        // 清除快取並重新載入檔案
        delete require.cache[require.resolve('../userListWithEpic.json')];
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

    appForUser.get('/api/json/users/by-address/:address/epic002', (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        
        // 清除快取並重新載入檔案
        delete require.cache[require.resolve('../userListWithEpic.json')];
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

    appForUser.get('/api/json/users/by-id/:id/epic002', (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        
        // 清除快取並重新載入檔案
        delete require.cache[require.resolve('../userListWithEpic.json')];
        // 取得json檔的資料
        const data = require('../userListWithEpic.json');
        // 取得參數
        const id = req.params.id;
        // 尋找使用者
        const user = data.find(user => user.id === id);
        // 將資料回傳給使用者
        if (user) {
            res.json({ epic002: user.epic002 });
            } else {
            // 否則回傳錯誤訊息
            res.status(404).json({ error: 'User not found' });
            }
    });

    // subscribe to 'app_mention' event in your App config
    // need app_mentions:read and chat:write scopes
    app.event('app_mention', async ({ event, context, client, say }) => {
      try {
        const permalink = await client.chat.getPermalink({
            channel: event.channel,
            message_ts: event.ts
          });
        
        console.log(permalink.permalink);
        await fetchCatGif();
        ;
        // say() sends a message to the channel where the event was triggered
        await say({"blocks": [
            {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `${event.text} by <@${event.user}>`
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
        ]});
      }
      catch (error) {
      console.error(error);
      }
    });

    app.event("app_mention", async ({ event, client, body, headers }) => {
        try {
          
          // Verify the request signature
          // verifySignature({
          //   signature: headers["x-slack-signature"],
          //   signingSecret: process.env.SLACK_SIGNING_SECRET,
          //   body: body,
          // });
      
          // Create a new message block with the contents of the new message
          const block = {
            type: "section",
            text: {
              type: "mrkdwn",
              text: event.text,
            },
          };
      
          const headers = {
            type: "header",
            text: {
              type: "plain_text",
              text: "The latest shoutouts",
              emoji: true,
            },
          };
      
          // read the file to get the latest messageBlocksJson
          fs.readFile('messageBlocks.json', (err, data) => {
            if (err) {
              console.error(err);
            } else {
              let messageBlocks = JSON.parse(data); // parse the JSON string to object
              messageBlocks.unshift(block); // add the new message block to the beginning of the array
              messageBlocksJson = JSON.stringify(messageBlocks); // convert the messageBlocks object to JSON string
              messageBlocks.unshift(headers); // add the new message block to the beginning of the array
              
              // Publish the new message block to the home tab for all users
              client.views.publish({
                user_id: event.user,
                view: {
                  type: "home",
                  blocks: messageBlocks,
                },
              }).then(() => {
                // write the console.log to file
                fs.writeFile('messageBlocks.json', messageBlocksJson, (err) => {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log('messageBlocks is writed in.');
                  }
                });
              }).catch((error) => {
                console.error("Error:", error);
              });
            }
          });
      
        } catch (error) {
          console.error("Error:", error);
        }
      });
      
      // Handle all events with a listener for the "*" event type
      app.event("*", async ({ event }) => {
        console.log(`Received event: ${JSON.stringify(event)}`);
      });


    // 每5分鐘執行一次 'node ./src/index.js'
    schedule.scheduleJob('*/5 * * * *', function () {
        console.log('Running epic bot...');
        // 執行 'node ./src/index.js' 命令
        const { exec } = require('child_process');
        const options = { maxBuffer: 100 * 1024 * 1024 }; // 設定緩衝區大小上限為 100 MB
        exec('node ./src/index.js', options,  (error, stdout, stderr) => {
        if (error) {
            console.error(`bot failed: ${error}`);
            return;
        }
        console.log(`bot running successful: ${stdout}`);
        });
    });

    (async () => {
        await app.start(process.env.PORT || 3000);
        console.log('⚡️ Bolt app started');
      })();

    let port = process.env.PORT;
    if (port == null || port == "") {
        port = 8000;
    }
        
    appForUser.listen(port, () => {
        console.log("資料上傳");
    });
};

async function fetchCatGif() {
  const url = 'https://api.giphy.com/v1/gifs/random?api_key=UQjFBNNOWp8W2tC2st6Gcvv2u04Wo9Fh&tag=cat&rating=g';

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

serverSetting();