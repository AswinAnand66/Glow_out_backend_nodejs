import { randomBytes, createHash } from "crypto";

const multer = require('multer');

const rand = require('crypto').randomBytes(32).toString('hex');
export const settings = {
    dbPwdPvtKey: "A%6Fgd34Xc95@3049fdKc3jFl",
    jwtKey: 'a89938a9d6d3b8fbafeea4a97bfbf34cd2e5c3bb3f047075c3c9cce9de1b2758',
    pgDbConfig:{

        user: 'postgres',
        database: 'glowout',
        host: 'localhost', 
        password: 'postgresql',
        port: 5432, 
        // user:  process.env.Kushal_pguser,
        // database: process.env.Kushal_pgdatabase,
        // host : process.env.Kushal_pghost,
        // password: process.env.Kushal_pgpassword,
        // port: process.env.Kushal_pgport, 
        max: 50, // max number of clients in the pool
        idleTimeoutMillis: 10000,
    },
    tokenExpiresIn: '45m', 
    geoLocURL: 'https://nominatim.openstreetmap.org',
};
const crypto = require('crypto');

const ENCRYPTION_KEY = "5c88acf79eecbc7841@ar$tyudchtd^h";  //process.env.ENCRYPTION_KEY; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16
const MAIL_SERVICE_URL = process.env.Kushal_mailerurl;
//  const MAIL_SERVICE_URL = "http://test.appedo.com:8822/mailer";
 const SITE_URL = process.env.Kushal_site_url;
// const SITE_URL="http://localhost:4200/";

function encrypt(text:any) {
 let iv = crypto.randomBytes(IV_LENGTH);
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text:any) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(":"), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

function MD5Hash(msgBuffer:Buffer) {
    return createHash('md5').update(msgBuffer).digest("hex")
} 

function randBytes(length:any) {
    return randomBytes(length);
}

//storage location and file name
var store = multer.diskStorage({
	destination: function(req:any,file:any,cb:any) {
        console.log('KUSHAL',req.headers['suggestion_id']);
		cb(null, './uploads/'+req.headers['suggestion_id']+"/");
	},
	filename:function(req:any, file:any, cb:any){
		cb(null, Date.now()+'.'+file.originalname);
    }
});

let fileUpload = multer({storage:store}).single('file');
// module.exports.fileUpload = fileUpload;

module.exports = { decrypt, encrypt, settings, fileUpload, SITE_URL, MAIL_SERVICE_URL,MD5Hash, randBytes};

//running the service in production mode for the first time below code to be used.
/*
set NODE_ENV=production //only for the first time.
node data_mig.js
*/

