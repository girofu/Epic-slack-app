import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
const { App } = require("@slack/bolt");
const fs = require('fs');

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


let userIdInList = {};
let userList = [];

// get user list in slack work space
export async function getUserList() {
    // You probably want to use a database to store any user information ;)
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
          console.log('userList is writed in.');
      }
  }); 
};

