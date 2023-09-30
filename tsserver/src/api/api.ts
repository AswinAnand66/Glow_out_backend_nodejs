import Router from "express-promise-router";
import { settings } from "../config/constants"


const path = require("path");
const router = Router();
const config = require("../config/constants");
const usrCntrl = require("../controllers/userController");
const glowOutCntrl = require("../controllers/glowOutController");
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

// cron.schedule('0 0 15,20,25 * *', async () => {
//   const now = new Date();
//     await sendKushalMail()
//     console.log('Sending mail on:', now);
//   });
  
//   cron.schedule('0 0 26-31 * *', async () => {
//     const now = new Date();
//     const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
//     if (lastDayOfMonth - now.getDate() < 3) {
//       console.log('Sending mail on:', now);
//       await sendKushalMail()
//     }
//   });


  // cron for test runs every 10 mins // comment this for prod
  
  // cron.schedule('*/10 * * * *', async () => {
  //  const now = new Date();
  //    console.log('Sending mail on:', now);
  //    await sendKushalMail()
  //  });
  


  async function sendKushalMail(){
    try {
      let dt = new Date().getTime();
      await mailServiceCntrl.sendKushalMail();
      // accessLog( new Date().getTime() - dt, result.success);
     
    } catch (e:any){
      log.logger("error", `sendKushalMail Exception ${e.message}, ${e.stack}`);
    }
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
      let result = await glowOutCntrl.employees();
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"getAllStudents", error: true, message: e.message });
    }
  });

  router.get('/allAppointments', async (req:any, res) => {
    try {
      let result = await glowOutCntrl.allAppointments();
      // console.log('employees result:', result)
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"getAllStudents", error: true, message: e.message });
    }
  });

  router.get('/calAppointments', async (req:any, res) => {
    try {
      let result = await glowOutCntrl.calAppointments();
      // console.log('employees result router:', result)
      res.json(result); 
    } catch (e:any){
      res.json({ success: false,methodName:"getAllStudents", error: true, message: e.message });
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
    const token = req.headers['authorization'];
    if (!token) {
        res.json({ success: false, invalidToken: true, message: 'No token provided' });
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

router.post('/getDineStatus', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.getDineStatus(param);
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getDineStatus Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getDineStatus", error: true, message: e.message });
    }
  });

router.get('/getAllStudents', async (req:any, res) => {
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

router.post('/getAllReports', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.getAllReports(param);
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getAllReports Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getAllReports", error: true, message: e.message });
    }
  });

router.get('/getNeighbourStressed', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      // let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.getNeighbourStressed();
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getNeighbourStressed Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getNeighbourStressed", error: true, message: e.message });
    }
  });

router.get('/getAllStressAssemntDineCount', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let result = await usrCntrl.getAllStressAssemntDineCount();
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getAllStressAssemntDineCount Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getAllStressAssemntDineCount", error: true, message: e.message });
    }
  });

router.get('/getAllAssmntReports', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let result = await usrCntrl.getAllAssmntReports();
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getAllAssmntReports Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getAllAssmntReports", error: true, message: e.message });
    }
  });

router.get('/getAllDineReports', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let result = await usrCntrl.getAllDineReports();
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getAllDineReports Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getAllDineReports", error: true, message: e.message });
    }
  });

router.post('/getfilterReportbyDept', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.getfilterReportbyDept(param);
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getfilterReportbyDept Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getfilterReportbyDept", error: true, message: e.message });
    }
  });

router.get('/getDepartments', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let result = await usrCntrl.getDepartments();
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getDepartments Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getDepartments", error: true, message: e.message });
    }
  });

router.get('/getKushalWeek', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let result = await usrCntrl.getKushalWeek();
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getKushalWeek Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getKushalWeek", error: true, message: e.message });
    }
  });

  router.post('/getCounsellorStuDetails', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.getCounsellorStuDetails(param);
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getCounsellorStuDetails Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getCounsellorStuDetails", error: true, message: e.message });
    }
  });

  router.post('/updateCounsellorStuStatus', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let param = JSON.parse(config.decrypt(req.body.param));
      let result = await usrCntrl.updateCounsellorStuStatus(param);
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `updateCounsellorStuStatus Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"updateCounsellorStuStatus", error: true, message: e.message });
    }
  });

  router.get('/counsellorStuMapDetails', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let result = await usrCntrl.counsellorStuMapDetails();
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `counsellorStuMapDetails Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"counsellorStuMapDetails", error: true, message: e.message });
    }
  });

  router.get('/getCounsellorDetails', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let result = await usrCntrl.getCounsellorDetails();
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getCounsellorDetails Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getCounsellorDetails", error: true, message: e.message });
    }
  });

  router.get('/getAllCounsellingReport', async (req:any, res) => {
    try {
      let dt = new Date().getTime();
      let result = await usrCntrl.getAllCounsellingReport();
      accessLog(req, new Date().getTime() - dt, result.success);
      res.json(result);
     
    } catch (e:any){
      log.logger("error", `getAllCounsellingReport Exception ${e.message}, ${e.stack}`);
      res.json({ success: false,methodName:"getAllCounsellingReport", error: true, message: e.message });
    }
  });