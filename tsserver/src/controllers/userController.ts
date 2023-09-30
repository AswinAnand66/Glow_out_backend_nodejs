import { UserModel } from "../models/userModel";
const settings = require('../config/constants');
const {checkDb, dbConnected} = require("../controllers/initializeController");
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const log = require("../log");

 
let userClass = new UserModel();


function addLoginHistory(user:any, ipAddress:string, message:string, status:boolean, token:any) {
    if (dbConnected()){
        userClass.addLoginHistory(user, ipAddress,message,status,token);
    }
    else {
        checkDb();
    }
}


async function login(user:any, ipAdd:string, isApiCall?:boolean) {
    try {
        if (dbConnected()){
            let response;
            let result = await userClass.login(user.login_name, settings.settings.dbPwdPvtKey);
            if (result.success) {
                if (result.rowCount > 0) {
                    let details = result.rows[0];
                    if (user.password === details.password) {
                        const token = jwt.sign({ userId: details.id}, settings.settings.jwtKey, { expiresIn: settings.settings.tokenExpiresIn });
                        addLoginHistory(user.login_name, ipAdd, "Successfully logged", true, token);
                        let sendData = {token: token, user: {user_id: details.id, name: details.user_name, email: details.email, mobile:details.mobile}};
                        let encryptData = settings.encrypt(JSON.stringify(sendData));
                        response = {success: true, result: encryptData }
                    }else {
                        response = { success: false, invalidToken: false, message: "Invalid password" };
                        addLoginHistory(user.login_name, ipAdd, "Invalid password "+user.password, false, null);
                    }
                }
                else {
                    addLoginHistory(user.login_name, ipAdd, "Invalid login Name " + user.login_name, false, null);
                    response = { success: false, message: "Invalid login name " + user.login_name };
                }
                return response;
            }
            else {
                return {success: false, message: result.message};
            }
        }
        else {
            checkDb();
            return {success:false, error:true, message:"DB connection failure, please try after some time"};
        }
    }
    catch (e:any) {
        return {success:false, status:400, message:e.message};
    }
}

async function getloginldap(user: any, ipAdd: string) {
    try {
        if (dbConnected()) {
            let param = {
                username: user.login_name,
                password: user.password
            }
            let resp: any;
            let url = `https://icsrpis.iitm.ac.in/ldap/ldap.php`;
            //  let url = `https://ipm.icsr.in/ldap/ldap.php`;
            return fetch(url, { method: 'POST', body: JSON.stringify(param) })
                .then(async (res: any) => {
                    let resText = await res.text();
                    console.log(resText);
                    //resText = 'success';  // comment this for prod build
                    if (resText == 'success') {
                        let data = user.login_name.toLowerCase();
                        let role = user.login_role.toLowerCase();
                        let result = await userClass.loginLdap(data,role);
                        if (result.success) {
                            if (result.rowCount > 0) {
                                result.rows[0]['login_type'] = 'ldap';
                                let details = result.rows[0];
                                userClass.updLoginAccessLdap(details.fac_det_id);                                
                                const token = jwt.sign({ userId: details.fac_det_id}, settings.settings.jwtKey, { expiresIn: settings.settings.tokenExpiresIn });
                                delete details.hash_password;
                                delete details.salt;
                                addLoginHistory(user.login_name, ipAdd, "Successfully logged", true, token);
                                let sendData = {token: token, user: {user_id: details.fac_det_id, name: details.faculty_name, employee_id:details.employee_id, ldap_id:details.ldap_id, department_name:details.department_name, designation:details.designation}};
                                let encryptData = settings.encrypt(JSON.stringify(sendData));
                                resp = { success: true, invalidToken: false, message: "login successful", result: encryptData };
                            }
                            else {
                                resp = { success: false, invalidToken: false, message: "Your Id is not registered in KUSHAL. Please contact admin." };
                            }
                        }
                        else {
                            resp = { success: false, message: "Invalid login id Or password" + user.email };
                        }
                        return resp;
                    }
                    else {
                        resp = { success: false, invalidToken: false, message: "Check Your UserId and Password" };
                    }
                })
                .then((fullResponse: any) => {
                    if (fullResponse != undefined)
                        return fullResponse;
                    else
                        return resp;
                })
        }
        else {
            checkDb();
            return { success: false, message: "DB connection failure, please try after some time" };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}





async function getlogin(user: any, ipAdd: string) {
  try {
      if (dbConnected()) {
          let response;
          let result = await userClass.loginwithpassword(user.email);
          console.log('login result:', result.rows)
          // const { email, password, device_token } = req.body;
          if (result.success) {
              if (result.rowCount > 0) {
                  let details = result.rows[0];
                  console.log('details:', details)
                  // let hashPass = settings.MD5Hash(Buffer.concat([Buffer.from(user.password, 'base64'), Buffer.from(details.salt, 'hex')]));
                  // let hashPass = settings.MD5Hash(Buffer.concat([user.password, Buffer.from(details.salt, 'hex')]));
                  if (true) {
  
                      const token = jwt.sign({ userId: details.id}, settings.settings.jwtKey, { expiresIn: settings.settings.tokenExpiresIn });

                      let sendData = {token: token, user: details};
                      let encryptData = sendData
                      console.log('encryptData:', encryptData)
                      response = { success: true, invalidToken: false, message: "login successful", result: encryptData, data:sendData };
                 
                  } else {
                      response = { success: false, invalidToken: false, message: "Invalid password" };
                  }
              }
              else {
                  response = { success: false, message: "Invalid login id " + user.login_name };
              }
              return response;
          }
          else {
              return { success: false, message: result.message };
          }
      }
      else {
          checkDb();
          return { success: false, message: "DB connection failure, please try after some time" };
      }
  }
  catch (e: any) {
      return { success: false, status: 400, message: e.message };
  }
}

async function logout(token:string) {
    await userClass.logout(token);
}


function validateToken(token:string){
    try{
        let decoded = jwt.verify(token, settings.settings.jwtKey);
        if (!dbConnected()) {
            return { success: false, invalidToken: false, message: 'DB Connection Failure' };
        } else {
            return {success:true, decoded:decoded};
        }
    }
    catch (e:any){
        console.log('error',e);
        return { success: false, invalidToken: true, message: e.message};
    }
}

async function getStudentDetails(param:any){
  try{
    let result = await userClass.getStudentDetails(param)
    if (result.success){
        let encryptData;
        if (result.rowCount > 0){
          encryptData = settings.encrypt(JSON.stringify(result.rows));
        } else {
          encryptData = "";
        }
        return {success:true, rowCount:result.rowCount, result:encryptData};
      } else {
        return {success: false, message: result.message};
      }
  }catch(e:any){
    return {success:false, message:e.message};
  }
}

async function updateStudentStatus(param:any){
  try{ 
    let result;
    if(param.status_id){
       result = await userClass.updateStudentStatus(param);
    }else{
      result = await userClass.insertStudentStatus(param);
    }
    if (result.success){     
            return {success:true, rowCount:result.rowCount, result:result.rows};         
      } else {
        return {success: false, message: result.message};
      }
  }catch(e:any){
    return {success:false, message:e.message};
  }
}

async function saveUploadedDetails(param:any){
  try{  
    let result = await userClass.saveUploadedDetails(param); 
    if (result.success){     
            return {success:true, rowCount:result.rowCount, result:result.rows};         
      } else {
        return {success: false, message: result.message};
      }
  }catch(e:any){
    return {success:false, message:e.message};
  }
}

async function updateAssmntStatus(param:any){
  try{ 
   
    let result = await userClass.updateAssmntStatus(param);
  
    if (result.success){     
            return {success:true, rowCount:result.rowCount, result:result.rows};         
      } else {
        return {success: false, message: result.message};
      }
  }catch(e:any){
    return {success:false, message:e.message};
  }
}

async function updateDineStatus(param:any){
  try{ 
   
    let result = await userClass.updateDineStatus(param);
  
    if (result.success){     
            return {success:true, rowCount:result.rowCount, result:result.rows};         
      } else {
        return {success: false, message: result.message};
      }
  }catch(e:any){
    return {success:false, message:e.message};
  }
}

async function getAssmntStatus(param:any){
  try{ 
   
    let result = await userClass.getAssmntStatus(param);
  
    if (result.success){     
            return {success:true, rowCount:result.rowCount, result:result.rows};         
      } else {
        return {success: false, message: result.message};
      }
  }catch(e:any){
    return {success:false, message:e.message};
  }
}

async function getDineStatus(param:any){
  try{ 
   
    let result = await userClass.getDineStatus(param);
  
    if (result.success){     
            return {success:true, rowCount:result.rowCount, result:result.rows};         
      } else {
        return {success: false, message: result.message};
      }
  }catch(e:any){
    return {success:false, message:e.message};
  }
}

async function employees(){
  try{ 
   
    let result = await userClass.employees();
  
    if (result.success){     
            return {success:true, rowCount:result.rowCount, result:result.rows, data:result.rows};         
      } else {
        return {success: false, message: result.message};
      }
  }catch(e:any){
    return {success:false, message:e.message};
  }
}



async function getAllCounsellingReport(){
  try{
    let result = await userClass.getAllCounsellingReport()
    if (result.success){
        let encryptData;
        if (result.rowCount > 0){
          encryptData = settings.encrypt(JSON.stringify(result.rows));
        } else {
          encryptData = "";
        }
        return {success:true, rowCount:result.rowCount, result:encryptData};
      } else {
        return {success: false, message: result.message};
      }
  }catch(e:any){
    return {success:false, message:e.message};
  }
}


export = { login, logout, validateToken, getloginldap, getStudentDetails, updateStudentStatus, updateAssmntStatus, getAssmntStatus, getDineStatus, updateDineStatus,getlogin, saveUploadedDetails, getAllCounsellingReport, employees };
