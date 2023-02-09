const express = require('express');

// use server to upload userList
const appForUser = express();

export function serverSetting() {
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

serverSetting();