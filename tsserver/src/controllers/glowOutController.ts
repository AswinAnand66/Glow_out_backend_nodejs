import { GlowOutModel } from "../models/glowOutModel";
const settings = require('../config/constants');
const {checkDb, dbConnected} = require("../controllers/initializeController");
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const log = require("../log");

 
let glowOutClass = new GlowOutModel();
// export class GlowOutCntrl {
// constructor(){ }

async function employees(){
  console.log('in')
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


  async function allServices(){
    try{ 
     
      let result = await glowOutClass.allServices();
    
      if (result.success){     
              return {success:true, rowCount:result.rowCount, result:result.rows, data:result.rows};         
        } else {
          return {success: false, message: result.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }
  }

  async function addEmp(param:any){
    try{ 
     
      let result = await glowOutClass.addEmp(param);
    
      if (result.success){     
              return {success:true, rowCount:result.rowCount, result:result.rows, data:result.rows};         
        } else {
          return {success: false, message: result.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }
  }

  async function timeslot(param:any){
    try{ 
     
      let result: any = {}
      result['rows'] = [
            {
                "start_time": "09:00 AM",
                "end_time": "09:30 AM"
            },
            {
                "start_time": "09:30 AM",
                "end_time": "10:00 AM"
            },
            {
                "start_time": "10:00 AM",
                "end_time": "10:30 AM"
            },
            {
                "start_time": "10:30 AM",
                "end_time": "11:00 AM"
            },
            {
                "start_time": "11:00 AM",
                "end_time": "11:30 AM"
            },
            {
                "start_time": "11:30 AM",
                "end_time": "12:00 PM"
            }
        ]
    result['success'] = true;
    result['msg'] = 'Time slots'


      if (result.success){     
              return {success:true, rowCount:result.rowCount, result:result.rows, data:result.rows};         
        } else {
          return {success: false, message: result.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }
  }

  async function showEmployee(){
    try{ 
     
      let result = await glowOutClass.showEmployee();
    
      if (result.success){     
              return {success:true, rowCount:result.rowCount, result:result.rows, data:result.rows};         
        } else {
          return {success: false, message: result.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }
  }

  async function allClients(){
    try{ 
     
      let result = await glowOutClass.allClients();
    
      if (result.success){     
              return {success:true, rowCount:result.rowCount, result:result.rows, data:result.rows};         
        } else {
          return {success: false, message: result.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }
  }

  async function selectEmp(param:any){
    try{ 
     
      let result = await glowOutClass.selectEmp(param);
    
      if (result.success){     
              return {success:true, rowCount:result.rowCount, result:result.rows, data:result.rows};         
        } else {
          return {success: false, message: result.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }
  }

  async function showSalon(){
    try{ 
     
      let result = await glowOutClass.showSalon();

      let sunCheck = false;
      let monCheck = false;
      let tueCheck = false;
      let wedCheck = false;
      let thuCheck = false;
      let friCheck = false;
      let satCheck = false;
      result.rows.map((val:any)=>{
       if (val.sun === null || val.sun === '') {
        sunCheck = true;
      }
    
      if (val.mon === null || val.mon === '') {
        monCheck = true;
      }
    
      if (val.tue === null || val.tue === '') {
        tueCheck = true;
      }
    
      if (val.wed === null || val.wed === '') {
        wedCheck = true;
      }
    
      if (val.thu === null || val.thu === '') {
        thuCheck = true;
      }
    
      if (val.fri === null || val.fri === '') {
        friCheck = true;
      }
    
      if (val.sat === null || val.sat === '') {
        satCheck = true;
      }
      val['sunCheck'] = sunCheck;
      val['monCheck'] = monCheck;
      val['tueCheck'] = tueCheck;
      val['wedCheck'] = wedCheck;
      val['thuCheck'] = thuCheck;
      val['friCheck'] = friCheck;
      val['satCheck'] = satCheck;
      })

      console.log('resulr.rows',result.rows)
    
      if (result.success){     
              return {success:true, rowCount:result.rowCount, result:result.rows, data:result.rows};         
        } else {
          return {success: false, message: result.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }
  }

  async function services(){
    try{ 
     
      let data:any = {}
      let salon = await glowOutClass.showSalon();
      let categories = await glowOutClass.category()
      // console.log('categories:', categories)

      categories.rows.forEach(async(category:any) => {
        let service = await glowOutClass.service(category.cat_id);
        category['services'] = service.rows[0]
        // console.log('category.services:', category)
      });

      // console.log('categories:', categories)
      await new Promise(resolve => setTimeout(resolve, 3000));
      data['category'] = categories.rows;
      // console.log('data:', data['categories'])

    
      if (salon.success){     
              return {success:true, rowCount:salon.rowCount, result:data, data:data};         
        } else {
          return {success: false, message: salon.message};
        }
    }catch(e:any){
      return {success:false, message:e.message};
    }
  }




export = {employees, allAppointments, calAppointments, allServices, addEmp, showEmployee, allClients, showSalon, services, timeslot, selectEmp };
