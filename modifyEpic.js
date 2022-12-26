const userSelectedConversation = require("./userSelectedConversationObject.json")
const userList = require("./userList.json");
const { ConsoleLogger } = require("@slack/logger");
const fs = require('fs');



async function modifyEpic() {
    let userListWithEpic = userList;

    for (const user of userListWithEpic) {
        if (user.epic !== undefined) {
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
                            return u.real_name;
                        }
                    // return match;
                    } 
                });
                // console.log(newEpic);
                // console.log(newEpic);

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
            user.epic = newEpic;
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