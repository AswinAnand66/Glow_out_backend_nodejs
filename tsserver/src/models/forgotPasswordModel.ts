import e from "express";
import { stringify } from "querystring";


const psqlAPM = require('./psqlAPM');
const settings = require('../config/constants');
const log = require("../log");

export class ForgotPasswordModel {

 

    async getVerifyLinkDetails(email: any) {
        const queryText = "SELECT verify_code, is_valid, CASE WHEN validated_on >= now() - interval '3 hours' THEN true ELSE false END AS is_valid_on FROM verify_link WHERE email ilike $1 ";
        const queryParam = [email];
        return await psqlAPM.fnDbQuery('getVerifyLinkDetails', queryText, queryParam);
    }
  
    async updVerifyLink(param: any) {
        const queryText = "Update verify_link set verify_type = $2, verify_code = $3, modified_on = now(), is_valid = false WHERE email ilike $1";
        const queryParam = [param.email, param.type, param.verify_code];
        return await psqlAPM.fnDbQuery('updVerifyLink', queryText, queryParam);
    }
  
    async insVerifyLink(param: any) {
        const queryText = "INSERT INTO verify_link (email, verify_type, verify_code, validated_on, created_on, is_valid) values ($1, $2, $3, now(), now(), false)";
        const queryParam = [param.email, param.type, param.verify_code];
        return await psqlAPM.fnDbQuery('insVerifyLink', queryText, queryParam);
    }
  
    async validateEmail(param: any) {
        const queryText = "select email from counsellor_details where email = $1";
        const queryParam = [param.email]
        return await psqlAPM.fnDbQuery('qryModel.validateEmail', queryText, queryParam);
    }
  
    async validateOTP(param: any) {
        const queryText = "UPDATE verify_link SET validated_on = now(), is_valid = true WHERE email =$1 and verify_type =$2 and verify_code = $3";
        const queryParam = [param.email, param.type, param.otp];
        return await psqlAPM.fnDbQuery('validateOTP', queryText, queryParam);
    }
  
    async changeForgottenPassword(param: any) {
        const queryText = "UPDATE counsellor_details SET hash_password = $2, salt = $3 WHERE email =$1";
        const queryParam = [param.email, param.hash_password, param.salt];
        return await psqlAPM.fnDbQuery('changeForgottenPassword', queryText, queryParam);
    }
  
}