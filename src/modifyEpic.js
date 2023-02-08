const userSelectedConversation = require("../userSelectedConversationObject.json")
const userListWithRawEpic = require("../userListWithRawEpic.json");
const { ConsoleLogger } = require("@slack/logger");
const fs = require('fs');



export async function modifyEpic() {
    let userListWithEpic = userListWithRawEpic;

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
            let newEpic002;
            let epic002BotRemoved;
            // modify epic002
            for (const epic002 of user.epic002) {
                
                // find the pattern

                epic002BotRemoved = epic002.replaceAll("<@U04FCLTTECE>", "");

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
                newEpics002.push(newEpic002);
                // console.log(newEpics002);

            }
            user.epic002 = newEpics002;
            console.log(user);
        }
        
    }
   // make the console.log result to JSON file
   
   let userListWithEpicJson; 
   userListWithEpicJson = JSON.stringify(userListWithEpic)

   // write the console.log to file
   fs.writeFile('userListWithEpic.json', userListWithEpicJson, (err) => {
       if (err) {
           console.error(err);
       } else {
           console.log('數據已成功寫入檔案');
       }
   }); 
}