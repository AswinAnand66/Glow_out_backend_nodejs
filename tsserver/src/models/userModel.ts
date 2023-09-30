import e from "express";
import { stringify } from "querystring";


const psqlAPM = require('./psqlAPM');
const settings = require('../config/constants');
const log = require("../log");

export class UserModel {

    async loginwithpassword(email: string) {
        const queryText = "SELECT * FROM users WHERE email = $1 AND role = 2"
       
        const queryParam = [email];
        return await psqlAPM.fnDbQuery('login', queryText, queryParam);
    };

    async updLoginAccess(userId: number) {
        let query = "UPDATE counsellor_details SET last_access_on = now() WHERE user_id = $1;";
        let qryParam = [userId];
        return await psqlAPM.fnDbQuery('updLoginAccess', query, qryParam);
    }

    async loginLdap(user_id: string, role:any) {
        // const queryText = "SELECT u.user_id, u.employee_id, u.name, u.email_id,u.department, u.ldap_id FROM login_user_ldap u WHERE u.ldap_id = $1;"
        let queryText;
        let queryParam;
        if(role=='professor'){         
            queryText = "SELECT u.fac_det_id, u.employee_id, u.faculty_name, u.department_name, u.ldap_id, u.designation FROM faculty_details u WHERE u.ldap_id = $1 AND LOWER(designation) LIKE '%' || $2 || '%';"
             queryParam = [user_id,role];

        }else{
            queryText = "SELECT u.fac_det_id, u.employee_id, u.faculty_name, u.department_name, u.ldap_id, u.designation FROM faculty_details u WHERE u.ldap_id = $1 AND LOWER(designation) NOT LIKE '%professor%';"
            queryParam = [user_id];
        }
        return await psqlAPM.fnDbQuery('loginLdap', queryText, queryParam);
    };


    async updLoginAccessLdap(userId: number) {
        let query = "UPDATE faculty_details SET last_access_on = now() WHERE fac_det_id = $1;";
        let qryParam = [userId];
        return await psqlAPM.fnDbQuery('updLoginAccessLdap', query, qryParam);
    }

    async login (email:string,password:any){
        const queryText = "SELECT id, pgp_sym_decrypt(password_encrypted::bytea, $2) AS password, email, user_name, mobile from login_user where login_name = $1 AND NOT is_deleted;";
        const queryParam = [email,password];
        return await psqlAPM.fnDbQuery('login', queryText, queryParam);
    };


    async addLoginHistory(login_name:any, ipAddress:any, message:any, status:any, token:any) {
        let query = "INSERT INTO login_history(login_name, ip_address, status, remarks, session_id) VALUES ($1, $2, $3, $4, $5);";
        let qryParam = [login_name, ipAddress, status, message, token];
        return await psqlAPM.fnDbQuery('loginHistory', query, qryParam);
    }

    async logout(token:string){
        const queryText = "UPDATE login_history SET logout_at = now(), remarks = $1 WHERE session_id= $2";
        const queryParam = ["Successfully Logged Out", token];
        return await psqlAPM.fnDbQuery('logoutUser', queryText, queryParam);
    }

    async getStudentDetails(param:any){
        // const queryText = "SELECT * FROM student_details sd JOIN map_prof_to_stu mps ON sd.roll_number = mps.stu_roll_number WHERE mps.employee_id = $1 AND mps.kushal_week_id = $2;";
        // const queryText = "select * from student_details_new s left join fac_stu_map f on f.stu_roll_number = s.roll_number where f.fac_emp_id = $1 and f.kushal_week_id = $2";
        const queryText = "select s.*,f.*, fss.status_id, fss.has_met, fss.date, fss.stress_shown, fss.other_issues, fss.is_student_fine, fss.current_week, fss.current_year, fss.status_count from student_details_new s left join fac_stu_map f on f.stu_roll_number = s.roll_number LEFT JOIN fac_stu_status fss ON f.map_id = fss.map_id AND fss.current_month = $2 where f.fac_emp_id = $1";

        const queryParam = [param.employee_id, param.current_month];
        return await psqlAPM.fnDbQuery('getStudentDetails', queryText, queryParam);
    }

    async updateStudentStatus(param:any){
        // const queryText = "UPDATE map_prof_to_stu SET status = $2, modified_on = now() where map_id = $1";
      

        const queryText = "UPDATE fac_stu_status SET map_id =$1, employee_id=$2, stu_roll_number=$3, has_met=$4, stress_shown=$5,other_issues=$6, current_week= $7, current_month= $10, current_year=$8, modified_on = now() where status_id = $9";
        const queryParam = [param.map_id, param.fac_emp_id, param.stu_roll_number, param.has_met,   param.stress_shown,param.other_issues, param.current_week,param.current_year,param.status_id, param.current_month];
        return await psqlAPM.fnDbQuery('updateStudentStatus', queryText, queryParam);
    }


    async updateAssmntStatus(param:any){
        let data = param.data;
        let queryText;
          queryText = `WITH del AS ( DELETE FROM assmnt_status WHERE employee_id = $1 AND month_number = $2 AND year_number = $3) INSERT INTO assmnt_status (employee_id, assmnt_name, stu_roll_number, week_number,month_number, year_number, is_absent, student_name, created_on) VALUES `
        for(let idx = 0;idx<data.length;idx++){
          queryText += `( $1 , '${data[idx].assmnt_name}','${data[idx].stu_roll_number}', ${data[idx].week_number}, ${data[idx].month_number}, ${data[idx].year_number}, ${data[idx].is_absent}, '${data[idx].student_name}', '${data[idx].created_on}'  )`
            if(idx < data.length - 1) {
                    queryText += ','
                }
          };

        const queryParam = [param.employee_id, param.month_number, param.year_number];
        return await psqlAPM.fnDbQuery('updateAssmntStatus', queryText, queryParam);
    }
    
    async updateDineStatus(param:any){
        let data = param.data;
        let queryText;
          queryText = `WITH del AS ( DELETE FROM dine_status WHERE employee_id = $1 AND month_number = $2 AND year_number = $3) INSERT INTO dine_status (employee_id, mess_name,is_food_good, stu_roll_number, week_number,month_number, year_number, is_absent, student_name, created_on, remarks) VALUES `
        for(let idx = 0;idx<data.length;idx++){
          queryText += `( $1 , '${data[idx].mess_name}', '${data[idx].is_food_good}','${data[idx].stu_roll_number}', ${data[idx].week_number}, ${data[idx].month_number}, ${data[idx].year_number}, ${data[idx].is_absent}, '${data[idx].student_name}', '${data[idx].created_on}', '${data[idx].remarks}'  )`
            if(idx < data.length - 1) {
                    queryText += ','
                }
          };

        const queryParam = [param.employee_id, param.month_number, param.year_number];
        return await psqlAPM.fnDbQuery('updateDineStatus', queryText, queryParam);
    }

    async getAssmntStatus(param:any){

        let queryText = 'SELECT * FROM assmnt_status WHERE employee_id = $1 AND month_number = $2 AND year_number = $3;'
        const queryParam = [param.employee_id, param.month_number, param.year_number];
        return await psqlAPM.fnDbQuery('getAssmntStatus', queryText, queryParam);
    }

    async getDineStatus(param:any){

        let queryText = 'SELECT * FROM dine_status WHERE employee_id = $1 AND month_number = $2 AND year_number = $3;'
        const queryParam = [param.employee_id, param.month_number, param.year_number];
        return await psqlAPM.fnDbQuery('getDineStatus', queryText, queryParam);
    }

    async getAllStudents(){

        let queryText = 'SELECT * FROM student_details_new'
        return await psqlAPM.fnDbQuery('getAllStudents', queryText, []);
    }

    async insertStudentStatus(param:any){


        const queryText = "INSERT INTO fac_stu_status (map_id, employee_id, stu_roll_number,has_met,  stress_shown, other_issues, current_week, current_year, current_month) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
        const queryParam = [param.map_id, param.fac_emp_id, param.stu_roll_number, param.has_met, param.stress_shown, param.other_issues,param.current_week,param.current_year, param.current_month];
        return await psqlAPM.fnDbQuery('insertStudentStatus', queryText, queryParam);
    }

    async getAllReports(param:any){
    //     const queryText = `SELECT 
    //     map.stu_roll_number, 
    //     status.has_met, 
    //     status.date as meeting_date, 
    //     status.place, 
    //     status.planned_meeting, 
    //     status.stress_shown, 
    //     status.has_room_mates, 
    //     status.is_roommate_fine, 
    //     status.other_issues, 
    //     status.problem_addressed,
    //     status.is_student_fine,
    //     status.selected_option,
    //     fd.employee_id AS faculty_employee_id,
    //     fd.faculty_name AS faculty_name,
    //     fd.department_name AS faculty_department_name,
    //     sd.roll_number AS student_roll_number,
    //     sd.student_name AS student_name,
    //     sd.email AS student_email,
    //     sd.contact_no AS student_contact_no,
    //     sd.semester AS student_semester,
    //     map.status
    // FROM fac_stu_map map
    // LEFT JOIN (
    //     SELECT 
    //         stu_roll_number, 
    //         MAX(modified_on) AS latest_modified_on 
    //     FROM fac_stu_status 
    //     GROUP BY stu_roll_number
    // ) latest_status ON map.stu_roll_number = latest_status.stu_roll_number
    // LEFT JOIN fac_stu_status status ON map.map_id = status.map_id AND status.modified_on = latest_status.latest_modified_on
    // LEFT JOIN faculty_details fd ON map.fac_emp_id = fd.employee_id
    // LEFT JOIN student_details_new sd ON map.stu_roll_number = sd.roll_number;
    // `;

  // below is for getting data week wise

//   let queryText='';
//   let kusahalStartWeek = param.kushal_start_week;
//     for(let start = param.kushal_start_week;start<=param.current_week;start++){
//            queryText += `SELECT fac_stu_map.*, fd.faculty_name,fd.employee_id,fd.department_name, sd.student_name,sd.roll_number, sd.email ,fac_stu_status.has_met, fac_stu_status.current_week, fac_stu_status.modified_on as meeting_date, ${start} as start_week
//            FROM fac_stu_map
//            LEFT JOIN fac_stu_status ON fac_stu_map.map_id = fac_stu_status.map_id AND fac_stu_status.current_week = ${start}
//            left join faculty_details fd on fd.employee_id = fac_stu_map.fac_emp_id 
//            left join student_details_new sd on sd.roll_number = fac_stu_map.stu_roll_number `
//            if (start < param.current_week) {
//                       queryText += ' UNION ALL '
//             }
//         kusahalStartWeek++
//     }
//         return await psqlAPM.fnDbQuery('getKushalWeek', queryText, []);

    // below is to get data month wise

  let queryText='';
  for(let startYear = param.kushal_start_year;startYear<= param.current_year;startYear++){
        for(let startMonth = param.kushal_start_month;startMonth<=param.current_month;startMonth++){
            queryText += `SELECT fac_stu_map.*, fd.faculty_name,fd.employee_id,fd.department_name, sd.student_name,sd.roll_number, sd.email, sd.hostel_name, sd.room_no, sd.gender, sd.contact_no, fac_stu_status.has_met, fac_stu_status.stress_shown, fac_stu_status.other_issues, fac_stu_status.current_week,fac_stu_status.current_month, fac_stu_status.modified_on as meeting_date, ${startMonth} as start_month
            FROM fac_stu_map
            LEFT JOIN fac_stu_status ON fac_stu_map.map_id = fac_stu_status.map_id AND fac_stu_status.current_month = ${startMonth}
            left join faculty_details fd on fd.employee_id = fac_stu_map.fac_emp_id 
            left join student_details_new sd on sd.roll_number = fac_stu_map.stu_roll_number `
            if (startMonth < param.current_month) {
                        queryText += ' UNION ALL '
                }
        }
    }
        return await psqlAPM.fnDbQuery('getAllReports', queryText, []);
    }

    async getAllAssmntReports(){
        // const queryText = "select ats.*, fd.faculty_name , fd.department_name  from assmnt_status ats left join faculty_details fd on fd.employee_id = ats.employee_id";
        const queryText = ` select ats.*, fd.faculty_name , fd.department_name ,sdn.email ,sdn.hostel_name, sdn.room_no, sdn.gender ,sdn.contact_no  from assmnt_status ats 
        left join faculty_details fd on fd.employee_id = ats.employee_id
        left join student_details_new sdn on ats.stu_roll_number  = sdn.roll_number order by ats.assmnt_id`;
        return await psqlAPM.fnDbQuery('getAllAssmntReports', queryText, []);
    }

    async getNeighbourStressed(){
        const queryText = `WITH w_first_target AS (
            SELECT fac_stu_status.stu_roll_number AS stu_roll_number, fac_stu_status.current_week, fac_stu_status.current_year, fac_stu_status.current_month, fac_stu_status.has_met, sdn.hostel_name AS sdn__hostel_name,
            sdn.room_no AS sdn__room_no, sdn.student_name AS sdn__student_name, sdn.gender AS sdn__gender, 
            sdn.email AS sdn__email, sdn.contact_no AS sdn__contact_no, fd.faculty_name AS fd__faculty_name, true as reported_student, fac_stu_status.modified_on as meeting_date  
            FROM fac_stu_status
            LEFT JOIN student_details_new sdn ON fac_stu_status.stu_roll_number = sdn.roll_number 
            LEFT JOIN faculty_details fd ON fac_stu_status.employee_id = fd.employee_id
            WHERE fac_stu_status.other_issues = 'yes'
            ),
            w_second_target AS (
            SELECT sd_nghbr.roll_number AS stu_roll_number, w_first_target.current_week, w_first_target.current_year, w_first_target.current_month, fac_stu_status.has_met, sd_nghbr.hostel_name AS sdn__hostel_name,
            sd_nghbr.room_no AS sdn__room_no, sd_nghbr.student_name AS sdn__student_name, 
            sd_nghbr.gender AS sdn__gender, sd_nghbr.email AS sdn__email, sd_nghbr.contact_no AS sdn__contact_no, 
            fd.faculty_name AS fd__faculty_name, false as reported_student, w_first_target.meeting_date as meeting_date   
            FROM w_first_target 
            inner  JOIN student_details_new AS sd_nghbr ON upper(sd_nghbr.room_no) = lower(sd_nghbr.room_no)
            AND sd_nghbr.hostel_name = w_first_target.sdn__hostel_name
              AND ( w_first_target.sdn__room_no::INT = sd_nghbr.room_no::INT-1 OR w_first_target.sdn__room_no::INT = sd_nghbr.room_no::INT+1 
              OR w_first_target.sdn__room_no::INT = sd_nghbr.room_no::INT ) 
            LEFT JOIN fac_stu_status ON fac_stu_status.stu_roll_number = sd_nghbr.roll_number
            left join fac_stu_map fsm on fsm.stu_roll_number = sd_nghbr.roll_number
            LEFT JOIN faculty_details fd ON fsm.fac_emp_id = fd.employee_id
            ),
            w_clean AS (
            SELECT DISTINCT ON (stu_roll_number, current_month) * FROM (
            SELECT * FROM w_first_target 
            UNION 
            SELECT * FROM w_second_target 
            ) AS unit
            ORDER BY stu_roll_number asc, current_month,  reported_student DESC
            )
            SELECT * FROM w_clean ORDER BY sdn__hostel_name ASC, reported_student desc, sdn__room_no DESC;            
            `
        return await psqlAPM.fnDbQuery('getNeighbourStressed', queryText, []);
    }

    async getAllStressAssemntDineCount(){
        const queryText = `SELECT stu_roll_number, stress_shown, assmnt_status_count, dine_status_count
        FROM (
            SELECT stu_roll_number, stress_shown, NULL AS assmnt_status_count, NULL AS dine_status_count
            FROM fac_stu_status
            WHERE stress_shown = 'yes'
            UNION ALL
            SELECT stu_roll_number, NULL, COUNT(stu_roll_number)::text AS assmnt_status_count, NULL AS dine_status_count
            FROM assmnt_status
            GROUP BY stu_roll_number
            UNION ALL
            SELECT stu_roll_number, NULL, NULL AS assmnt_status_count, COUNT(stu_roll_number)::text AS dine_status_count
            FROM dine_status
            GROUP BY stu_roll_number
        ) AS combined_data`;
        return await psqlAPM.fnDbQuery('getAllStressAssemntDineCount', queryText, []);
    }

    async getAllDineReports(){
        const queryText = `select ds.*, fd.faculty_name , fd.department_name , sdn.email ,sdn.hostel_name, sdn.room_no, sdn.gender ,sdn.contact_no 
        from dine_status ds 
        left join faculty_details fd on fd.employee_id = ds.employee_id
        left join student_details_new sdn on ds.stu_roll_number  = sdn.roll_number`;
        return await psqlAPM.fnDbQuery('getAllDineReports', queryText, []);
    }

    async getfilterReportbyDept(param:any){
        const queryText = "";
        return await psqlAPM.fnDbQuery('getfilterReportbyDept', queryText, []);
    }
    async getDepartments(){
        const queryText = "select * from departments";
        return await psqlAPM.fnDbQuery('getDepartments', queryText, []);
    }

    async getKushalWeek(){
        const queryText = "select * from kushal_week ORDER BY id desc";
        return await psqlAPM.fnDbQuery('getKushalWeek', queryText, []);
    }


    // counsellor model

    
    async getCounsellorStuDetails(param:any){
   
        const queryText = `select s.*,c.*,fd.faculty_name, css.status_id, css.has_met, css.date, css.need_parental_care, css.need_psychiatric_treatment,css.meeting_with_student, css.is_student_fine, css.current_week, css.current_year , css.remarks
        from student_details_new s 
        left join counsellor_stu_map c on c.stu_roll_number = s.roll_number
        left join fac_stu_map fsm on fsm.stu_roll_number = s.roll_number 
        left join faculty_details fd on fd.employee_id = fsm.fac_emp_id 
        LEFT JOIN counsellor_stu_status css ON c.map_id = css.map_id where c.counsellor_id = $1
        `;

        const queryParam = [param.counsellor_id];
        return await psqlAPM.fnDbQuery('getCounsellorStuDetails', queryText, queryParam);
    }

    async updateCounsellorStuStatus(param:any){


        const queryText = "UPDATE counsellor_stu_status SET map_id =$1, counsellor_id=$2, stu_roll_number=$3, accepted_to_meet=$4, student_met=$5, current_week= $6, current_month= $7, current_year=$8, meeting_with_student = $10, date = now() , remarks = $11 where status_id = $9";
        const queryParam = [param.map_id, param.counsellor_id, param.stu_roll_number, param.accepted_to_meet,   param.student_met, param.current_week, param.current_month, param.current_year,param.status_id, param.meeting_with_student , param.remarks];
        return await psqlAPM.fnDbQuery('updateCounsellorStuStatus', queryText, queryParam);
    }

    async saveUploadedDetails(param:any){ 
        let data = param.data;
        let queryText =`INSERT INTO counsellor_stu_map ( stu_roll_number,counsellor_id,week_number, month_number, year_number) VALUES `
        for(let idx=0;idx<data.length;idx++){
          queryText+= `('${data[idx].roll_number}', '${data[idx].counsellor_id}', $1, $2, $3 )`
             if (idx < data.length - 1) {
                queryText += ','
             }
         }   
         queryText += ';'
          const queryParam = [param.week_number, param.month_number, param.year_number];
          return await psqlAPM.fnDbQuery('saveUploadedDetails', queryText, queryParam);
    }

    async counsellorStuMapDetails(){

        let queryText = 'SELECT * FROM counsellor_stu_map'
        return await psqlAPM.fnDbQuery('counsellorStuMapDetails', queryText, []);
    }

    async getCounsellorDetails(){

        let queryText = 'SELECT user_id, email, name, counsellor_id FROM counsellor_details'
        return await psqlAPM.fnDbQuery('getCounsellorDetails', queryText, []);
    }

    async insertCounsellorStuStatus(param:any){

        const queryText = "INSERT INTO counsellor_stu_status (map_id, counsellor_id, stu_roll_number, accepted_to_meet, student_met, date, current_week, current_year, current_month, meeting_with_student,remarks) VALUES ($1, $2, $3, $4, $5, now(), $6, $7, $8, $9,$10)";
        const queryParam = [param.map_id, param.counsellor_id, param.stu_roll_number,param.accepted_to_meet, param.student_met, param.current_week,param.current_year, param.current_month, param.meeting_with_student,param.remarks];
        return await psqlAPM.fnDbQuery('insertCounsellorStuStatus', queryText, queryParam);
    }

    async getAllCounsellingReport(){
        // const queryText = "select ats.*, fd.faculty_name , fd.department_name  from assmnt_status ats left join faculty_details fd on fd.employee_id = ats.employee_id";
        const queryText = ` select csm.map_id, csm.stu_roll_number, csm.counsellor_id, 
        css.status_id, css.accepted_to_meet, css.student_met,css.meeting_with_student, css.has_met, css.is_student_fine , css.need_parental_care , css.need_psychiatric_treatment, css."date", css.remarks, sdn.student_name, sdn.gender, sdn.email as student_email, sdn.contact_no as student_contact_no, 
        cd."name" as counsellor_name, cd.email as counsellor_email from 
        counsellor_stu_map csm   
        left join counsellor_stu_status css on csm.map_id = css.map_id 
        left join student_details_new sdn on csm.stu_roll_number = sdn.roll_number 
        left join counsellor_details cd on csm.counsellor_id = cd.counsellor_id `;
        return await psqlAPM.fnDbQuery('getAllCounsellingReport', queryText, []);
    }
    
    async employees(){

        const queryText = ` select * from employee `;
        return await psqlAPM.fnDbQuery('getAllCounsellingReport', queryText, []);
    }



}