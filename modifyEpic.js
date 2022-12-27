const userSelectedConversation = require("./userSelectedConversationObject.json")
const userList = require("./userList.json");
const { ConsoleLogger } = require("@slack/logger");
const fs = require('fs');



async function modifyEpic() {
    let userListWithEpic = userList;

    for (const user of userList) {
        if (user.epic !== undefined) {
            let newEpics = [];
            let newEpic;
            for (const epic of user.epic) {
                const pattern = /<@(.*?)>/g;
                let match;
                const matches = [];
                // let newEpic = epic;
                let i = 0;
                // find the pattern


                newEpic = epic.replace(/<@.*?>/g , (match) => {
                    // console.log(match)
                    for (const u of userList) {
                        let userId = "<@" + u.id + ">";
                        // console.log(userId);
                        if (userId === match) {
                            let userName = "<" + u.real_name + ">"; 
                            return userName;
                            
                        }
                    // return match;
                    } 
                });
                console.log(newEpic);
                newEpics.push(newEpic);
                console.log(newEpics);

                // while ((match = pattern.exec(newEpic)) !== null) {
                    
                //     // use user id to replace the pattern site
                //     for (const u of userList) {
                //         if (u.id === match[1]) {
                //             // console.log(match);
                //             // console.log(u.id);
                //             // console.log(match[1]);
                //             // console.log(u.real_name);
                //             newEpic = epic.replace(/<@.*?>/, u.real_name);
                //         }
                //     } 
                //     console.log(match);
                // }

            }
            user.epic = newEpics;
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

modifyEpic();

module.exports = {
    modifyEpic,
  };