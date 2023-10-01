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

    async allServices(){

        const queryText = `SELECT * FROM service WHERE status = 1 AND salon_id = 1 AND isdelete = 0`;
        return await psqlAPM.fnDbQuery('allServices', queryText, []);
    }

    async addEmp(param:any){
    console.log('param:', param)

        const queryText = `SELECT * FROM service WHERE status = 1 AND salon_id = 1 AND isdelete = 0`;
        return await psqlAPM.fnDbQuery('allServices', queryText, []);
    }

    async showEmployee(){

        const queryText = `select * from employee where id = 1`;
        return await psqlAPM.fnDbQuery('allServices', queryText, []);
    }

    async allClients(){
        const queryText = `SELECT * FROM users WHERE status = 1 AND role = 3`;
        return await psqlAPM.fnDbQuery('allClients', queryText, []);
    }

    async showSalon(){
        const queryText = `select * from salon where owner_id = 2`;
        return await psqlAPM.fnDbQuery('showSalon', queryText, []);
    }

    async category(){
        const queryText = `SELECT * FROM category WHERE status = true`;
        return await psqlAPM.fnDbQuery('services', queryText, []);
    }

    async service(cat_id:any){
        const queryText = `SELECT * FROM service WHERE salon_id = 1 AND cat_id = $1 ORDER BY cat_id DESC`;
        const queryParm = [cat_id]
        return await psqlAPM.fnDbQuery('services', queryText, queryParm);
    }


}
