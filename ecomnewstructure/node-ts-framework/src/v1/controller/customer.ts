
import express from "express";
import Joi, { func, object, valid } from "joi";
import { dbProduct } from "../model/dbproduct";
import { functions } from "../library/functions";
import { validations } from "../library/validations";
import { dbCustomer } from "../model/dbcustomer";
const jwt = require("jsonwebtoken");
import {generatetokenForCustomer,authenticateJwtForCustomer} from "./customerAuthenticaton"
import {passwordHashing,performPasswordComparison} from "./sellerAuthentication"

const router = express.Router();

 
// routes 

router.post("/signup_customer", customerSignUpSchema,customerSignUp);
router.post("/customer_login",customerLoginSchema,customerLogin);
router.put("/edit_customer",authenticateJwtForCustomer,editCustomerSchema,editCustomerDetails);
router.get("/showOrders",authenticateJwtForCustomer,showOrders)
router.get("/orderFullDetails",authenticateJwtForCustomer,showOrderFullDetails)
router.get("/search_key",searchProduct);

module.exports = router;


let functionsObj=new functions();
let customerObj = new dbCustomer();
let productObj=new dbProduct();

function customerSignUpSchema(req: any, res: any, next: any) {

    let schema = Joi.object({

      customer_name: Joi.string().min(2).max(50).trim().required(),
      customer_email: Joi.string().email().lowercase().min(12).max(35).trim().required(),
      customer_password: Joi.string().alphanum().min(8).max(100).trim().required(),
      customer_address: Joi.string().trim().required(),
      customer_bankacc: Joi.number().required(),
      customer_phone: Joi.number().min(1000000000).max(9999999999).required(),
    
    } )

    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
      return false;
    }
  }

  // Handler for Customer registration route

async function customerSignUp(req: any, res: any) {

    let {customer_name,customer_email,customer_password,customer_address,customer_bankacc,customer_phone} = req.body;
   
    let functionsObj = new functions();
  
    let validCustomer: any = {

      customer_name,
      customer_email,
      customer_password,
      customer_address,
      customer_bankacc,
      customer_phone

    };
   
        let customerObj = new dbCustomer();
        
        let isEmailUnique: any =await customerObj.checkUniqueFieldsdb( "customer_email",customer_email);
        if (isEmailUnique[0])
        {
          return res.status(400).json({ error: " email has already registered." });
        }

        let isBankaccUnique: any =await customerObj.checkUniqueFieldsdb("customer_bankacc",customer_bankacc);
        if (isBankaccUnique[0])  {
          return  res.status(400).json({ error: "This Bank account number has already registered." });
        }
        
        let isPhoneUnique: any =await customerObj.checkUniqueFieldsdb("customer_phone",customer_phone);
        if (isPhoneUnique[0]) 
        {
          return res.status(400).json({ error: "This phone numbeer has  already registered." });  
        }
       
       let hashedPassword:any=await passwordHashing(customer_password) 
      
      if(!hashedPassword){
        return res.status(500).json({error:"internal server errror. "})
      }  
       
      validCustomer['customer_password'] = hashedPassword; 
      let result = await customerObj.customerSignUpdb(validCustomer);
     
      if (!result) {
       return res.send(functionsObj.output(500, "Account registration failed.", null));
      } else { 
        const token = await generatetokenForCustomer(result);
        console.log(token);
       return res.send(functionsObj.output(201, "Account created", result));
      }
      
  }

// Customer login schema

  function customerLoginSchema(req: any, res: any, next: any) {

    let schema = Joi.object({
      customer_email: Joi.string().lowercase().min(12).max(50).trim().required(),
      customer_password: Joi.string().min(6).max(50).trim().required()
    });
  
    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
      return false;
    }
  }
  
//handler for Customer_login route
  
  async function customerLogin(req: any, res: any) {

    let customer_email = req.body.customer_email;
    let customer_password = req.body.customer_password;
  

    let customerObj = new dbCustomer();
    let functionsObj = new functions();
  
    let result:any=await customerObj.getCustomerDetailsdb(customer_email);

    // Check if no customer details were found

    if(!result[0])
    {
      return res.send(functionsObj.output(400, "Invalid Credintials."));
    }
  
    let customerHashPassoword:any=result[0].customer_password;
    let compare:any=await performPasswordComparison(customer_password,customerHashPassoword);
   
      
    if(compare==null)  return res.send(functionsObj.output(500,"internal server error! "))
       
    if(compare==false) return res.send(functionsObj.output(400, "Invalid Credintials. "));
      
    const customer_id: number = result[0].id;
    const token = await generatetokenForCustomer(customer_id);

    console.log(token);
  
    if(true){
  
      let {customer_password,...rest} = result[0];
      console.log("you have succesfully login");
      
      return res.send(functionsObj.output(200, "Succesfully Login",{rest,token}))
    }
  }


  
// Middleware for validating Customer update request

function editCustomerSchema(req: any, res: any, next: any) {

    let schema = Joi.object({
      customer_name: Joi.string().min(2).max(50).trim().optional(),
      customer_email: Joi.string().email().lowercase().min(12).max(40).trim().optional(),
      customer_password: Joi.string().alphanum().min(8).max(100).trim().optional(),
      new_password:Joi.string().alphanum().min(8).max(100).trim().optional(),
      customer_address: Joi.string().max(100).optional(),
      customer_bankacc: Joi.number().optional(),
      customer_phone: Joi.number().min(1000000000).max(9999999999).optional(),
    }); 
  
    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
      return false;
    }
  
  }

  // Handler for Customer update route

 async function editCustomerDetails(req: any, res: any) {

    const data = req.body;
    
    const customer_id: number =req.customer_id;

    if(!customer_id)
    {
      return res.status(400).json({error:"not receiving customer_id"});
    }
 
    if (Object.keys(data).length === 0) {
      return res.send(functionsObj.output(400, "Please provide fields.", null));
    }
    
    const {new_password}=req.body;
    

    const editableFields = [
      "customer_name", 
      "customer_email",
      "customer_password",  
      "customer_address",
      "customer_bankacc",
      "customer_phone",
    ];

    let validUpdate: any ={};

    for (const field of editableFields) {
      if (data[field] != undefined) {
        validUpdate[field] = data[field];
      }
    }
     
   
    if (data["customer_email"] != undefined)
     {
        let isEmailUnique: any = await customerObj.checkUniqueFieldsdb( "customer_email",validUpdate["customer_email"]);

        if (isEmailUnique[0])
        {
         return res.status(400).json({ error: "This email has already registered." });
        }  
    }     
    

    if(data["customer_bankacc"]!=undefined)
    {
        let isBankaccUnique: any = await customerObj.checkUniqueFieldsdb("customer_bankacc",validUpdate["customer_bankacc"]);
        if (isBankaccUnique[0])
        {
          return  res.status(400).json({ error: "This bank account  number has already registered." });
        }
    }

    if(data["customer_phone"]!=undefined)
    {
      let isPhoneUnique: any = await customerObj.checkUniqueFieldsdb("customer_phone",validUpdate["customer_phone"]);
      if (isPhoneUnique[0]) 
      {
        return res.status(400).json({ error: "This Phone Nubmer has already  registered." });
      }
    }
     
    if(data["customer_password"]!=undefined )  
    {  
  
       if(new_password==undefined)
       {
        return res.send(functionsObj.output(400, "Please provide new password in order to change the password !"));
       }
        
       let result:any=await customerObj.fetchCustomerPassworddb(customer_id);
        console.log("before fetchpassword2");

      if(new_password===data["customer_password"])
      {
        return res.send(functionsObj.output(400, "New Password Should be unique from the previous one!"));
      }

      if(!result[0] ) 
      {
        return res.send(functionsObj.output(400, "Invalid Credintials."));
      }

      let customerHashPassoword:any=result[0].seller_password;
      let compare:any=await performPasswordComparison(data["customer_password"],customerHashPassoword);
       
         
      if(compare===null) {
         return res.send(functionsObj.output(500,"internal server  error."))
      }

      if(compare==false)
        {
          return res.send(functionsObj.output(400, "You are providing wrong password.!"));
        } 
          
      let genrateHashedPassword:any=await passwordHashing(new_password);
    
      if(!genrateHashedPassword) 
        {
          return res.status(500).json({error:"internal server errror..... "})
        }
        validUpdate['customer_password'] = genrateHashedPassword;  

    }
   
    let result: any = await customerObj.editCustomerDetailsdb(customer_id,validUpdate);

    if (!result) {
     return res.send(functionsObj.output(500, "Internal Server Error...aur", null));
    } else {
     return res.send(functionsObj.output(200, "Seller data has been successfully updated.", result));
    }
  
}

async function showOrders (req:any,res:any) {

  const customer_id:number=req.customer_id;
 // console.log(customer_id)
  let resultOfOrders:any=await customerObj.customerOrdersdb(customer_id);
  
   if(!resultOfOrders[0]){
    return res.send(functionsObj.output(200,"sucess",null));
    }
     return res.send(functionsObj.output(200,"sucess",resultOfOrders));  
}

async function showOrderFullDetails (req:any,res:any) {

  const customer_id:number=req.customer_id;
 // console.log(customer_id)
  let resultOfOrders:any=await customerObj.customerOrdersDetailsdb(customer_id);
  
   if(!resultOfOrders[0]){
    return res.send(functionsObj.output(200,"sucess",null));
    }
     return res.send(functionsObj.output(200,"sucess",resultOfOrders));  
}

//
async function searchProduct (req:any,res:any) {

  const {product_name}=req.body;
  console.log(product_name);
  
  if(!product_name){
  return res.status(400).json({message:"enter the keyword."})
  }
  let  resultOfSearch:any=await productObj.searchProductdb(product_name);
  console.log(resultOfSearch);
    
}

