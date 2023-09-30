import e from "express";
import { stringify } from "querystring";


const psqlAPM = require('./psqlAPM');
const settings = require('../config/constants');
const log = require("../log");

export class MailServiceModel {



    async getKushalMail(param:any){
        
        // const queryText = `select fd.faculty_name, fsm.fac_emp_id AS employee_id, array_agg(fsm.stu_roll_number) as stu_roll_numbers
        // FROM fac_stu_map fsm left join faculty_details fd on fd.employee_id = fsm.fac_emp_id 
        // WHERE stu_roll_number NOT IN (
        //     SELECT stu_roll_number
        //     FROM fac_stu_status where current_month = $1
        // )
        // GROUP BY fsm.fac_emp_id, fd.faculty_name;`;
        const queryText = `select fd.faculty_name, fsm.fac_emp_id AS employee_id, fd.faculty_email, array_agg(fsm.stu_roll_number) as stu_roll_numbers
        FROM fac_stu_map fsm left join faculty_details fd on fd.employee_id = fsm.fac_emp_id 
        WHERE  stu_roll_number NOT IN (
            SELECT stu_roll_number
            FROM fac_stu_status where current_month = $1 and current_year = $2
        )
        GROUP BY fsm.fac_emp_id, fd.faculty_name, fd.faculty_email       
        UNION all      
        select DISTINCT fd.faculty_name, fac_emp_id AS employee_id, fd.faculty_email, (ARRAY[]::VARCHAR[]) AS stu_roll_numbers
        from fac_stu_map fsm 
        left join faculty_details fd on fd.employee_id = fsm.fac_emp_id 
        where fac_emp_id not in (
            select fsm.fac_emp_id
            FROM fac_stu_map fsm 
            WHERE  stu_roll_number NOT IN (
                SELECT stu_roll_number
                FROM fac_stu_status where current_month = $1 and current_year = $2
            )
            GROUP BY fsm.fac_emp_id
        )
        `;

        const queryParam = [param.current_month, param.current_year]
        return await psqlAPM.fnDbQuery('getKushalMail', queryText, queryParam);
    }
}