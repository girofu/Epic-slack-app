// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient(SLACK_BOT_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
});


const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN, 
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app started');
})();

// subscribe to 'app_mention' event in your App config
// need app_mentions:read and chat:write scopes
app.event('app_mention', async ({ event, context, client, say }) => {
  try {
    await say({"blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `<@${event.user}> give them more!`
        },
        // "accessory": {
        //   "type": "button",
        //   "text": {
        //     "type": "plain_text",
        //     "text": "Button",
        //     "emoji": true
        //   },
        //   "value": "click_me_123",
        //   "action_id": "first_button"
        // }
      }
    ]});
  }
  catch (error) {
    console.error(error);
  }
});
