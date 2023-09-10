//new ecom file

import express from "express";
import Joi, { func, object, valid } from "joi";
import { functions } from "../library/functions";
import { validations } from "../library/validations";
import { dbSeller } from "../model/sellerdb";
const jwt = require("jsonwebtoken");
import {generateJWTToken,authenticateJWT,passwordHashing,performPasswordComparison} from "./sellerAuthentication"
const router = express.Router();



router.post("/signup_seller", sellerSignUpSchema, sellerSignUp);
router.post("/seller_login", sellerLoginSchema, sellerLogin);
router.put("/edit_seller",authenticateJWT,editSellerSchema,editSellerDetails);


module.exports = router;

// Middleware for validating seller registration request

function sellerSignUpSchema(req: any, res: any, next: any) {

  let schema = Joi.object({
    seller_name: Joi.string().min(2).max(50).trim().required(),
    seller_email: Joi.string().email().lowercase().min(12).max(35).trim().required(),
    seller_password: Joi.string().alphanum().min(8).max(100).trim().required(),
    seller_address: Joi.string().trim().required(),
    seller_bankacc: Joi.number().required(),
    seller_phone: Joi.number().min(1000000000).max(9999999999).required(),
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

// Handler for seller registration route

async function sellerSignUp(req: any, res: any) {

  let {seller_name,seller_email,seller_password,seller_address,seller_bankacc,seller_phone,} = req.body;
 
  let functionsObj = new functions();

  let validSeller: any = {
    seller_name,
    seller_email,
    seller_password,
    seller_address,
    seller_bankacc,
    seller_phone
  };
 
      let sellerObj = new dbSeller();
   
      let isEmailUnique: any =await sellerObj.checkUniqueFields( "seller_email",seller_email);
      if (isEmailUnique[0]) {
        return res.status(400).json({ error: " email has already registered." }); 
       
      }

      let isBankaccUnique: any =await sellerObj.checkUniqueFields("seller_bankacc",seller_bankacc);
      if (isBankaccUnique[0]) {
        return  res.status(400).json({ error: "This Bank account number has already registered." });
        }
 
      let isPhoneUnique: any =await sellerObj.checkUniqueFields("seller_phone",seller_phone);
      if (isPhoneUnique[0]) {
        return res.status(400).json({ error: "This phone numbeer has  already registered." });
       }
     
     let hashedPassword:any=await passwordHashing(seller_password) 
    
    if(!hashedPassword){
      return res.status(500).json({error:"internal server errror. "})
    }  
     
    validSeller['seller_password'] = hashedPassword; 
    let result = await sellerObj.sellerSignUpdb(validSeller);
   
    if (!result) {
     return res.send(functionsObj.output(500, "Account registration failed.", null));
    } else { 
      const token = await generateJWTToken(result);
      console.log(token);
     return res.send(functionsObj.output(201, "Account created", result));
    }
    
}

// Middleware for validating  login_seller request

function sellerLoginSchema(req: any, res: any, next: any) {

  let schema = Joi.object({
    seller_email: Joi.string().lowercase().min(12).max(50).trim().required(),
    seller_password: Joi.string().min(6).max(50).trim().required()
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

//handler for seller_login route

async function sellerLogin(req: any, res: any) {
  
  let seller_email = req.body.seller_email;
  let seller_password = req.body.seller_password;

//OBJECT CREATION

  let sellerObj = new dbSeller();
  let functionsObj = new functions();

///let result: any = await sellerObj.sellerLogindb(seller_email,seller_password);
 
  let result:any=await sellerObj.getSellerDetails(seller_email);
   
  if(!result[0] ) return res.send(functionsObj.output(400, "Invalid Credintials."));


  let sellerHashPassoword:any=result[0].seller_password;
  let compare:any=await performPasswordComparison(seller_password,sellerHashPassoword);
 
  if(compare==null) return res.send(functionsObj.output(500,"internal server error! "))
     
  if(compare==false)return res.send(functionsObj.output(400, "Invalid Credintials. "));
    
  

  const seller_id: number = result[0].id;
  const token = await generateJWTToken(seller_id);
  console.log(token);

  if(true){

    let {seller_password,...rest} = result[0];
    console.log("you have succesfully login");
    
    return res.send(functionsObj.output(200, "Succesfully Login",rest))
  }
}

// Middleware for validating seller update request

function editSellerSchema(req: any, res: any, next: any) {

  let schema = Joi.object({
    seller_name: Joi.string().min(2).max(50).trim().optional(),
    seller_email: Joi.string().email().lowercase().min(12).max(40).trim().optional(),
    seller_password: Joi.string().alphanum().min(8).max(100).trim().optional(),
    new_password:Joi.string().alphanum().min(8).max(100).trim().optional(),
    seller_address: Joi.string().max(100).optional(),
    seller_bankacc: Joi.number().optional(),
    seller_phone: Joi.number().min(1000000000).max(9999999999).optional(),
  }); 

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }

}

// Handler for seller update route

async function editSellerDetails(req: any, res: any) {

  const seller_id: number =req.seller_id;
  if(!seller_id)
  {
    return res.status(400).json({error:"not receiving seller_id"});
  }
    const data = req.body;
    let functionsObj=new functions();
     
    if (Object.keys(data).length === 0) 
    {
      return res.send(functionsObj.output(400, "Please provide fields.", null));
    }
    
    const {new_password}=req.body;
    let sellerObj = new dbSeller();

    const editableFields = [
      "seller_name", 
      "seller_email",
      "seller_password",  
      "seller_address",
      "seller_bankacc",
      "seller_phone",
    ];

    let validUpdate: any ={};

    for (const field of editableFields) {
      if (data[field] != undefined) {
        validUpdate[field] = data[field];
      }
    }
     
   
    if (data["seller_email"] != undefined)
     {
      
        let isEmailUnique: any = await sellerObj.checkUniqueFields( "seller_email",validUpdate["seller_email"]);
        if (isEmailUnique[0]) return res.status(400).json({ error: "This email has already registered." });
    }

    if(data["seller_bankacc"]!=undefined)
    {
        let isBankaccUnique: any = await sellerObj.checkUniqueFields("seller_bankacc",validUpdate["seller_bankacc"]);
        if (isBankaccUnique[0]) return  res.status(400).json({ error: "This account number has already registered." });

    }

    if(data["seller_phone"]!=undefined)
    {
      let isPhoneUnique: any = await sellerObj.checkUniqueFields("seller_phone",validUpdate["seller_phone"]);
      if (isPhoneUnique[0])  return res.status(400).json({ error: "This  Phone Number has already registered." });
      
    }

  
    if(data["seller_password"]!=undefined )  
    {  
       
      if(new_password==undefined)   return res.send(functionsObj.output(400, "Please provide new password in order to change the password !"));

      let result:any=await sellerObj.fetchSellerPassword(seller_id);

      if(!result[0] )  return res.send(functionsObj.output(400, "Invalid Credintials."));
      if(new_password===data["seller_password"]) return res.send(functionsObj.output(400, "New Password Should be unique from the previous one!"));
            

      let sellerHashPassoword:any=result[0].seller_password;
      let compare:any=await performPasswordComparison(data["seller_password"],sellerHashPassoword);
  
      if(compare===null)  return res.send(functionsObj.output(500,"internal server  error"));
      if(compare==false) return res.send(functionsObj.output(400, "You are providing wrong password.!"));
        
      let genrateHashedPassword:any=await passwordHashing(new_password);
      if(!genrateHashedPassword) return res.status(500).json({error:"internal server errror. "})
        
      validUpdate['seller_password'] = genrateHashedPassword;  

    }
      
    let result: any = await sellerObj.editSellerDetailsdb(seller_id,validUpdate);

    if (!result) {
     return res.send(functionsObj.output(500, "Internal Server Error.", null));
    } else {
     return res.send(functionsObj.output(200, "Seller data has been successfully updated.", result));
    }
  
}
