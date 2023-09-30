const psqlAPM = require('./psqlAPM');
export class Initialize {
    constructor(){ };
    async checkDB(){
        let queryText = "SELECT now()";
        return await psqlAPM.fnDbQuery('checkDBAtLaunch', queryText, []);
    }
}