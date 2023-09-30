import { ForgotPasswordModel } from "../models/forgotPasswordModel";
const settings = require('../config/constants');
const {checkDb, dbConnected} = require("../controllers/initializeController");
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const log = require("../log");

let forgotPasswordClass = new ForgotPasswordModel

async function getOTP(param: any) {
    try {
        let msg;
        let is_valid_on = false, IsResSuccess = false;
        const verify_code = Math.floor(Math.random() * (999999 - 100000) + 100000);
        param["verify_code"] = verify_code;
        const result = await forgotPasswordClass.getVerifyLinkDetails(param.email);
        if (result.success && result.rowCount > 0) {
            const updateResult = await forgotPasswordClass.updVerifyLink(param);
            IsResSuccess = updateResult.success;
        } else {
            const insResult = await forgotPasswordClass.insVerifyLink(param);
            IsResSuccess = insResult.success;
        }
        if (IsResSuccess) {
            const link = settings.SITE_URL + "/forgotpassword";
            let sNumber = verify_code.toString().split("");
            let code = sNumber.map(Number);
            const mailDetails = {
                code1: code[0],
                code2: code[1],
                code3: code[2],
                code4: code[3],
                code5: code[4],
                code6: code[5],
                unsubscribe_emailid: "sspsupport@smail.iitm.ac.in",
                forgotpasswordurl: link,
                // contact_us_url:"https://www.pmrf.in/contact",
                // email_template_support_url:"https://www.pmrf.in/faq"
            }
            let mailResponse = is_valid_on ? { success: true } : await sendMail(param.email, mailDetails, 'kushal-forgot-password', "Request For Kushal Password Reset");
            msg = !mailResponse.success ? "Failed to send PIN, Please try again after some time" : "Verification PIN has been sent to your email.";
            return { success: mailResponse.success, is_valid_on: is_valid_on, message: msg };
        } else {
            return { success: false, message: "Failed to send PIN Please Try Again" };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
  }
  
  async function sendMail(email: any, mailDetails: any, htmlFileName: String, subject: string) {
    try {
        const emailId = {
            emailId: email,
            cc: '',
            bcc: '',
        }
        const emailParam = {
            htmlFile: htmlFileName,
            mailDetails: JSON.stringify(mailDetails),
            emailIds: JSON.stringify(emailId),
            mailSubject: subject,
        };
        const url = settings.MAIL_SERVICE_URL + "/getMailParam";
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(emailParam),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const jsonRes = await response.json();
        if (jsonRes.success) {
            return { success: true };
        } else {
            return { success: false, message: jsonRes.message };
        }
    } catch (e: any) {
        console.log("sendMail", e);
        return { success: false, message: e.message };
    }
  }
  
  async function validateEmail(param: any) {
    try {
        let result = await forgotPasswordClass.validateEmail(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
  }
  
  async function validateOTP(param: any) {
    try {
        let msg = '';
        const result = await forgotPasswordClass.getVerifyLinkDetails(param.email);
        if (result.rows[0].verify_code == param.otp) {
            await forgotPasswordClass.validateOTP(param);
            msg = "Validation Successful"
            return { success: true, message: msg };
        }
        else {
            return { success: false, message: "PIN match failed, Please Check" };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
  }
  
  async function changeForgottenPassword(param: any) {
    try {

        const salt = settings.randBytes(32);
        param["hash_password"] = settings.MD5Hash(Buffer.concat([Buffer.from(param.password, 'base64'), salt]));
        param["salt"] = salt.toString('hex');
        const result = await forgotPasswordClass.changeForgottenPassword(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        console.log(e);
        return { success: false, message: e.message };
    }

}


export = {getOTP,validateEmail, validateOTP, changeForgottenPassword };
