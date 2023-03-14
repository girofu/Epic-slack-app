let messageBlocksJson = require('../messageBlocks.json');

const fs = require('fs');

// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");

const { App, verifySignature } = require("@slack/bolt");

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
});

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  logLevel: LogLevel.DEBUG,
});

const messageBlocks = [];

// make the console.log result to JSON file
// let messageBlocksJson;

// Subscribe to the "app_mention" event

function homePage() {app.event("app_mention", async ({ event, client, body, headers }) => {
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

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("Server started!");
})();
}

homePage();
