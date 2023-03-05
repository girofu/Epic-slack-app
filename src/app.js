
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import {getUserList} from "./getUserList";
import {modifyEpic} from "./modifyEpic";
import {epicWriteIn} from "./epicWriteIn";
import {findConversation} from "./selectConversation";
dotenv.config()
const express = require('express');

// Require the Bolt package (github.com/slackapi/bolt)
const fs = require('fs');
const http = require('http');
require('dotenv').config();

const retrieveingTime = new Date();
const retrieveingTimeStamp = retrieveingTime.setDate();

async function asyncFunc() {
    await getUserList();
    await findConversation();
    await epicWriteIn();
    await modifyEpic();
};

asyncFunc();


// (async () => {
//   // Start your app
//   await app.start(process.env.PORT || 3000);

//   console.log('⚡️ Bolt app is running!');
// })();