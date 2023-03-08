import * as dotenv from 'dotenv'
require('dotenv').config();
dotenv.config()

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
  socketMode: true,
});

const express = require('express');

// use server to upload userList
const appForUser = express();

const schedule = require('node-schedule');

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
        await say({"blocks": [
            {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `<@${event.user}> 你的shoutout已發送!`
            },
            "accessory": {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "查看成就背包",
                "emoji": true
              },
              "value": "click_me_123",
              "url": "https://picchu.io/da0/",
              "action_id": "first_button"
            }
            },
            {
                "type": "image",
                "image_url": "https://upload.cc/i1/2023/03/06/eB0yPT.png",
                "alt_text": "inspiration"
            }
        ]});
        }
        catch (error) {
        console.error(error);
        }
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

serverSetting();