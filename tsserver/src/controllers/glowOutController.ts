import { GlowOutModel } from "../models/glowOutModel";
const settings = require('../config/constants');
const {checkDb, dbConnected} = require("../controllers/initializeController");
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const log = require("../log");

 
let glowOutClass = new GlowOutModel();

async function employees(){
    try{ 
     
      let result = await glowOutClass.employees();
    
      if (result.success){     
              return {success:true, rowCount:result.rowCount, result:result.rows, data:result.rows};         
        } else {
          return {success: false, message: result.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }

  }


async function calAppointments(){
    try{ 
     
      let result = await glowOutClass.calAppointments();
    
      if (result.success){     
              return {success:true, rowCount:result.rowCount, result:result.rows, data:result.rows};         
        } else {
          return {success: false, message: result.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }
  }

async function allAppointments(){
    try{ 
     
      let result = await glowOutClass.allAppointments();
      let [pendingAppointmentsResult, approvedAppointmentsResult, canceledAppointmentsResult, currencyResult] = await Promise.all([glowOutClass.pendingAppointmentsResult(), glowOutClass.approvedAppointmentsResult(), glowOutClass.canceledAppointmentsResult(), glowOutClass.currencyResult()]);
      if(pendingAppointmentsResult.success && approvedAppointmentsResult.success){
          let result = [];
          result.push(pendingAppointmentsResult.rows);
          result.push(approvedAppointmentsResult.rows);
          result.push(canceledAppointmentsResult.rows);
          return {success: true, rowCount: result.length, result: result, message: pendingAppointmentsResult.message};
      }
    
      if (result.success){     
              return {success:true, rowCount:result.rowCount, result:result.rows, data:result.rows};         
        } else {
          return {success: false, message: result.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }
  }



export = {employees, allAppointments, calAppointments };
