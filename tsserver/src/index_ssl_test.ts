import express from "express";
import path from "path";
import cors from "cors";
// import compression from "compression";

const compression = require('compression')
const mountRoutes = require("./api/api");
const log = require("./log");
log.logger("info","Log Service Started");
log.dblog("info","Db Log Service Started");
const fs = require('fs');

const app = express();
app.use(compression());


//SSL CONFIG
var key = fs.readFileSync(process.env.Kushal_sslkey);
var cert = fs.readFileSync(process.env.Kushal_sslcert);
var ca = fs.readFileSync(process.env.Kushal_sslca);

var options = {
	key: key,
	cert: cert,
	ca: ca
};

// var httpsPort=9443;
// var https = require('https');
// https.createServer(options, app).listen(httpsPort, '10.0.1.128', () => console.log('ADQVest Server listening on port '+httpsPort+'!'));

var httpsPort = process.env.Kushal_httpsPort;
var https = require('https');
https.createServer(options, app).listen(httpsPort, process.env.Kushal_httpsip, () => console.log('KUSHAL Server listening on port '+httpsPort+'!'));
//HTTP listening port can be modified by changing below.
//var httpPort=8000;
//var http = require('http');
//http.createServer(app).listen(httpPort, () => console.log('WAKA Server listening on port '+httpPort+'!'));

app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:443']
}));

app.use(express.json({limit: '15mb'}));
app.use(express.urlencoded({
    limit: '15mb',
    extended: true
}));
app.use(function(req,res,next){
	res.removeHeader("X-Powered-By");
	res.setHeader('Access-Control-Allow-Headers', 'Orgin, X-Requested-With, Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', ['OPTIONS','GET','POST']);
	res.setHeader("Access-Control-Allow-Credentials", "false");
	res.header("X-powered-by", "PMRF 1.0");
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
	res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
	res.setHeader("Content-Security-Policy", "frame-ancestors 'self';");
	res.setHeader('X-Frame-Options', 'DENY');
	res.setHeader('X-Content-Type-Options', "nosniff");
	res.setHeader('X-XSS-Protection', "1; mode=block");
    res.setHeader('Referrer-Policy', 'strict-origin');
    if (req.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
	next();
})
app.use(express.static(path.join(__dirname, '../../kushal-ui/dist/kushal-ui/')));
app.use("/api",mountRoutes);

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../kushal-ui/dist/kushal-ui/index.html')));

//var httpPort = 3000;
//app.listen(httpPort, () => console.log('WAKA Node Server listening on port ' + httpPort + '!'));

process.on('unhandledRejection', (err:Error) => {
    console.error(`Uncaught Exception: ${err.message}`);
    log.logger('error',`unhandledRejection ${err.message} in process ${process.pid}`);
})

process.on('uncaughtException', (err:Error) => {
    log.logger('error',`uncaughtException ${err.message} in process ${process.pid}`);
    console.error(`Uncaught Exception: ${err.message}`);
})
