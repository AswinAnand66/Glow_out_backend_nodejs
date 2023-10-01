import Router from "express-promise-router";
import { settings } from "../config/constants"


const path = require("path");
const router = Router();
const config = require("../config/constants");
const usrCntrl = require("../controllers/userController");
const GlowOutCntrl = require("../controllers/glowOutController");
const cmn = require("../controllers/initializeController");
const mailServiceCntrl = require("../controllers/mailServiceController");
const forgotPasswordCntrl = require("../controllers/forgotPasswordController");
const log = require("../log");
const multer = require("multer");
const upload = multer();
const cron = require('node-cron');


module.exports = router;

cmn.checkDb();

function getRequestIP(req:any) {
    var ip;
    if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else {
        ip = req.ip;
    }
    return ip;
}

function accessLog(req:any, duration:number, status:boolean) {
    log.accesslog("info", `${getRequestIP(req)}, ${req.url}, ${status}, ${duration}`);
}

  


  

router.post('/login', async (req, res) =>{
  console.log('req:', req.body)
  console.log('login')
    try{
      let result;
      let dt = new Date().getTime();
      let start = Date.now();
      let user = req.body;
      result = await usrCntrl.getlogin(user, getRequestIP(req));
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
    } catch (e:any) {
      console.log("login eror",e);
      log.logger("error", `usrCntrl.login Exception ${e.message}, ${e.stack}`);
      res.json({success:false, error:true, message: e.stack});
    }
  });



  router.get('/allAppointments', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let result = await usrCntrl.getAllStudents();
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getAllStudents Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getAllStudents", error: true, message: e.message });
    }

  });


  router.get('/employees', async (req:any, res) => {
    try {
      let result = await GlowOutCntrl.employees();
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"employees", error: true, message: e.message });
    }
  });

  router.get('/allAppointments', async (req:any, res) => {
    try {
      let result = await GlowOutCntrl.allAppointments();
      // console.log('employees result:', result)
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"allAppointments", error: true, message: e.message });
    }
  });

  router.get('/calAppointments', async (req:any, res) => {
    try {
      let result = await GlowOutCntrl.calAppointments();
      // console.log('employees result router:', result)
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"calAppointments", error: true, message: e.message });
    }
  });

  router.get('/allServices', async (req:any, res) => {
    try {
      let result = await GlowOutCntrl.allServices();
      // console.log('employees result router:', result)
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"allServices", error: true, message: e.message });
    }
  });

  router.get('/showEmployee/1', async (req:any, res) => {
    try {
      const param = req.body;
      console.log('showEmployee param:', param)
      let result = await GlowOutCntrl.showEmployee();
      // console.log('employees result router:', result)
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"showEmployee", error: true, message: e.message });
    }
  });

  router.get('/allClients', async (req:any, res) => {
    try {
      const param = req.body;
      let result = await GlowOutCntrl.showEmployee();
      // console.log('employees result router:', result)
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"allClients", error: true, message: e.message });
    }
  });

  router.get('/showSalon', async (req:any, res) => {
    try {
      const param = req.body;
      let result = await GlowOutCntrl.showSalon();
      // console.log('employees result router:', result)
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"showSalon", error: true, message: e.message });
    }
  });

  router.get('/services', async (req:any, res) => {
    try {
      const param = req.body;
      let result = await GlowOutCntrl.services();
      // console.log('employees result router:', result)
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"services", error: true, message: e.message });
    }
  });

  router.post('/addEmp', async (req:any, res) => {
    try {
      const param = req.body;
      console.log('param:', param)
      let result = await GlowOutCntrl.addEmp(param);
      // console.log('employees result router:', result)
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"addEmp", error: true, message: e.message });
    }
  });

  router.post('/getOTP', async (req:any, res) => {
    try {
        const dt = new Date().getTime();
        const param = req.body.param;
        const result = await forgotPasswordCntrl.getOTP(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getOTP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
  });

  router.post('/validateOTP', async (req:any, res) => {
    try {
        const dt = new Date().getTime();
        const param = req.body.param;
        const result = await forgotPasswordCntrl.validateOTP(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `validateOTP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

  router.post('/validateEmail', async (req:any, res) => {
    try {
        let user = JSON.parse(Buffer.from(req.body.data, 'base64').toString());
        let dt = new Date().getTime();
        let result = await forgotPasswordCntrl.validateEmail(user);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `validateEmail Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/changeForgottenPassword', async (req:any, res) => {
  try {
      const dt = new Date().getTime();
      const param = JSON.parse(Buffer.from(req.body.param, 'base64').toString());
      // param['password'] = Buffer.from(param.password, 'base64');
      const result = await forgotPasswordCntrl.changeForgottenPassword(param);
      accessLog(req, new Date().getTime()-dt, result.success);
      res.json(result);
  } catch (e:any) {
      log.logger("error", `changeForgottenPassword Exception ${e.message}, ${e.stack}`);
      res.json({ success: false, error: true, message: e.message });
  }
});



  router.use(async (req: any, res, next) => {
    console.log('req:', req)
    const token = req.headers['authorization'];
    if (!token) {
        res.json({ success: true, invalidToken: true, message: 'No token provided' });
    } else {
        let result = usrCntrl.validateToken(token);
        if (result.success) {
            req.decoded = result.decoded;
            next();
        }
        else {
            res.json(result);
        }
    }
});

router.get('/logoutUser', async (req, res) => {
  let dt = new Date().getTime();
  const token = req.headers['authorization'];
  usrCntrl.logout(token);
  accessLog(req, new Date().getTime() - dt, true);
  res.json({success:true, invalidToken : false, message:'Successfully logged out'})
});

router.post('/getStudentDetails', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.getStudentDetails(param);
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getStudentDetails Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getStudentDetails", error: true, message: e.message });
    }
  });

router.post('/updateStudentStatus', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.updateStudentStatus(param);
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `updateStudentStatus Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"updateStudentStatus", error: true, message: e.message });
    }
  });

router.post('/saveUploadedDetails', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.saveUploadedDetails(param);
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `saveUploadedDetails Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"saveUploadedDetails", error: true, message: e.message });
    }
  });

router.post('/updateAssmntStatus', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.updateAssmntStatus(param);
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `updateAssmntStatus Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"updateAssmntStatus", error: true, message: e.message });
    }
  });

router.post('/updateDineStatus', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.updateDineStatus(param);
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `updateAssmntStatus Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"updateAssmntStatus", error: true, message: e.message });
    }
  });

router.post('/getAssmntStatus', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.getAssmntStatus(param);
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getAssmntStatus Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getAssmntStatus", error: true, message: e.message });
    }
  });












 