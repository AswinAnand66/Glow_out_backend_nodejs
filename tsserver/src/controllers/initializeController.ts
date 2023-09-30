import { Initialize  } from "../models/initialize";
let log = require("../log");

let initClass = new Initialize();
let dbConnected = false;

function setDbConnected(){
    return dbConnected;
}

async function checkDb(){
    let result = await initClass.checkDB();
    if (result.success) {
        dbConnected = true;
    } 
    else {
        dbConnected = false;
        log.logger("error",`checkDb(), PSQL Connection Error ${result.message}, trying to connect in 10 sec`);
        setTimeout(() => {
            checkDb();
        }, 10000);
    }
    console.log("DbConnected", dbConnected);
}

export = {dbConnected:setDbConnected, checkDb};
