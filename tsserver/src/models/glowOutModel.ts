import e from "express";
import { stringify } from "querystring";


const psqlAPM = require('./psqlAPM');
const settings = require('../config/constants');
const log = require("../log");

export class GlowOutModel {


    async employees(){

        const queryText = ` select * from employee `;
        return await psqlAPM.fnDbQuery('getAllCounsellingReport', queryText, []);
    }

    async calAppointments(){

        const queryText = ` SELECT * FROM booking WHERE salon_id = 2 AND booking_status != 'Cancel' ORDER BY id DESC `;
        return await psqlAPM.fnDbQuery('getAllCounsellingReport', queryText, []);
    }

    async allAppointments(){

        const queryText = ` select * from employee `;
        return await psqlAPM.fnDbQuery('getAllCounsellingReport', queryText, []);
    }

    async pendingAppointmentsResult(){

        const queryText = ` SELECT * FROM booking WHERE booking_status = 'Pending' AND salon_id = 2 ORDER BY id DESC' `;
        return await psqlAPM.fnDbQuery('getAllCounsellingReport', queryText, []);
    }

    async approvedAppointmentsResult(){

        const queryText = ` SELECT * FROM booking WHERE booking_status = 'Approved' AND salon_id = 2 ORDER BY id DESC `;
        return await psqlAPM.fnDbQuery('getAllCounsellingReport', queryText, []);
    }

    async canceledAppointmentsResult(){

        const queryText = `SELECT * FROM booking WHERE booking_status = 'Cancel' AND salon_id = $2 ORDER BY id DESC`;
        return await psqlAPM.fnDbQuery('getAllCounsellingReport', queryText, []);
    }

    async currencyResult(){

        const queryText = `SELECT currency, currency_symbol FROM adminsetting WHERE id = 1`;
        return await psqlAPM.fnDbQuery('getAllCounsellingReport', queryText, []);
    }


}
