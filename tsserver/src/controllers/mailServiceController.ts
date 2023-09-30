import { MailServiceModel } from "../models/mailServiceModel";
const settings = require('../config/constants');
const {checkDb, dbConnected} = require("../controllers/initializeController");
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const log = require("../log");

let mailServiceClass = new MailServiceModel();





async function sendKushalMail(){
    try{
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        let param = {
            current_month:month,
            current_year:year
        }
      let result = await mailServiceClass.getKushalMail(param)
      if (result.success){
          if(result.rowCount > 0){
            result.rows.map(async (val:any)=>{                
                let param = {
                    faculty_email:val.faculty_email,
                    faculty_name:val.faculty_name,
                    stu_roll_numbers:val.stu_roll_numbers.join(", ").replace(/'/g, "")
                }
                await sendEmail(param)
            })
          }
          return {success:true, rowCount:result.rowCount,};
        } else {
          return {success: false, message: result.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }
  }

  async function sendEmail(param: any) {
    try {
        let mailDetails = {         
            faculty_name: param.faculty_name,
            stu_roll_numbers:param.stu_roll_numbers
        }
        const emailId = {
            emailId: [param.faculty_email],
            cc: '',
            bcc: ''
        }
        const emailParam = {
            htmlFile: 'kushal-pending-list',
            mailDetails: JSON.stringify(mailDetails),
            emailIds: JSON.stringify(emailId),
            mailSubject: 'Update on Kushal /Assignment/Dining with students',
        };
        let url = settings.MAIL_SERVICE_URL + "/getMailParam";
        let response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(emailParam),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let jsonRes = await response.json();
        if (jsonRes.success) {
            return { success: true };
        } else {
            return { success: false, message: jsonRes.message };
        }
    } catch (e: any) {
        console.log("sendEmail error", e);
        return { success: false, message: e.message };
    }
}



  export = {sendKushalMail,};
