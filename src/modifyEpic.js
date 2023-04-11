import { channel } from "diagnostics_channel";

// const userSelectedConversation = require("../userSelectedConversationObject.json")
const userListWithRawEpic = require("../userListWithRawEpic.json");
const userList = require("../userList.json");
const channelName = require("../channelName.json");
const { ConsoleLogger } = require("@slack/logger");
const fs = require('fs');



export async function modifyEpic() {
    let userListWithEpic = userListWithRawEpic;
    console.log("modifyEpic start");

    for (const user of userListWithRawEpic) {
        if (user.epic !== undefined) {
            let newEpics = [];
            let newEpic;
            let epicBotRemoved;

            for (const epic of user.epic) {
                
                epicBotRemoved = epic.replaceAll("<@U04FCLTTECE>", "");
                // find the pattern

                newEpic = epicBotRemoved.replace(/<@.*?>/g , (match) => {
                    // console.log(match)
                    for (const u of userListWithRawEpic) {
                        let userId = "<@" + u.id + ">";
                        // console.log(userId);
                        if (userId === match) {
                            let userName = "<" + u.real_name + ">"; 
                            return userName;
                            
                        }
                    // return match;
                    } 
                });
                // console.log(newEpic);
                newEpics.push(newEpic);
                // console.log(newEpics);

            }
            user.epic = newEpics;
            // console.log(user);
        };

        if (user.epic002 !== undefined) {
            let newEpics002 = [];
            let epic002User;
            let newEpic002User;
            let newEpic002;
            let epic002BotRemoved;
            let targetStr;
            // modify epic002
            for (const epic002 of user.epic002) {
                
                // find the pattern
                epic002User = epic002.user

                epic002BotRemoved = epic002.text.replaceAll("<@U04FCLTTECE>", "Shoutout");

                newEpic002 = epic002BotRemoved.replace(/<@.*?>/g , (match) => {
                    // console.log(match)
                    for (const u of userListWithRawEpic) {
                        let userId = "<@" + u.id + ">";
                        // console.log(userId);
                        if (userId === match) {
                            let userName = "<" + u.real_name + ">"; 
                            return userName;
                        }
                    // return match;
                    } 
                });
                
                // console.log(newEpic002);
                epic002.text = newEpic002;
                // newEpics002.push(newEpic002);
                // console.log(newEpics002);

            }
            // user.epic002 = newEpics002;
            // console.log(user);
        }
        
    }

    userListWithEpic.forEach((item) => {
        if (item.epic002) {
            console.log("item.epic002 is true");
          item.epic002 = item.epic002.map((epic) => {
            const userObj = userList.find((user) => user.id === epic.user);
            const channel = channelName.find((channel) => channel.id === epic.channel); 
            console.log(userObj);
            if (userObj && channel) {
              return {
                ...epic,
                user: userObj.real_name,
                channel: channel.name,
              };
            } else {
              return epic;
            }
          });
        }
      });

      

   // make the console.log result to JSON file
   
   let userListWithEpicJson; 
   userListWithEpicJson = JSON.stringify(userListWithEpic)

   // write the console.log to file
   fs.writeFile('userListWithEpic.json', userListWithEpicJson, (err) => {
       if (err) {
           console.error(err);
       } else {
           console.log('modifyEpic finished');
       }
   }); 
}