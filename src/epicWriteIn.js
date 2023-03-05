const userSelectedConversation = require("../userSelectedConversationObject.json");
const userSelectedConversation002 = require("../userSelectedConversationObject002.json");
const userList = require("../userList.json");
const userAddressAndId = require("../userAddressAndId.json");
const fs = require('fs');


export async function epicWriteIn () {
    let userListWithRawEpic = userList;
    console.log("epicWriteIn start")
    for (const user of userListWithRawEpic) {
        // console.log(user);
        // console.log(user.id);
        let users = user.id;
        // console.log(userSelectedConversation[users]);
        let userEpic = userSelectedConversation[users];
        let userEpic002 = userSelectedConversation002[users];
        user["epic"] = userEpic;
        user["epic002"] = userEpic002
        // console.log(userList);
        const UserIdFromGoogleSheet = userAddressAndId.find(u => u[3] === users);
        if (UserIdFromGoogleSheet != undefined) {
            user["address"] = UserIdFromGoogleSheet[4].toLowerCase();
        };
    };

    // make the console.log result to JSON file
    let userListWithRawEpicJson;
    userListWithRawEpicJson = JSON.stringify(userListWithRawEpic)

    // write the console.log to file
    fs.writeFile('userListWithRawEpic.json', userListWithRawEpicJson, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('epicWriteIn finished');
        }
    }); 

}