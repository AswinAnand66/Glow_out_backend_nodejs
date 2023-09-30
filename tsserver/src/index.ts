import express from "express";
import path from "path";
import cors from "cors";
// import compression from "compression";
const compression = require('compression')


/* Integrate Api Calls */
const mountRoutes = require("./api/api");
// const mountService = require("./backgroundservice/widgetsquerystatus");

const log = require("./log");
log.logger("info","Log Service Started");
log.dblog("info","Db Log Service Started");

const app = express();
app.use(compression());
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:5443','http://localhost:3000']
}));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Orgin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Orgin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', ['GET', 'POST']);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
})

app.use(express.json({limit: '15mb'}));
app.use(express.urlencoded({
    limit: '15mb',
    extended: true
}));
app.use(express.static(path.join(__dirname, '../../kushal-ui/dist/kushal-ui/')));
app.use("/api/admin", mountRoutes);
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../kushal-ui/dist/kushal-ui/index.html')));
app.use(function applyXFrame(req, res, next) {
    res.set('X-Frame-Options', 'SAMEORIGIN');
    next();
});

// var httpPort = process.env.Kushal_httpPort;  // prod
var httpPort = 3000;    // local
app.listen(httpPort, () => console.log('GlowOut Node Server listening on port ' + httpPort + '!'));

process.on('unhandledRejection', (err:Error) => {
    console.error(`Uncaught Exception: ${err.message}`);
    log.logger('error',`unhandledRejection ${err.message} in process ${process.pid}`);
})

process.on('uncaughtException', (err:Error) => {
    log.logger('error',`uncaughtException ${err.message} in process ${process.pid}`);
    console.error(`Uncaught Exception: ${err.message}`);
})
