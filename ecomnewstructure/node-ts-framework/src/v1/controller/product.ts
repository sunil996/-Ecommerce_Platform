
import express from "express";
import Joi, { func, valid } from "joi";
import { functions } from "../library/functions";
import { validations } from '../library/validations';
import { dbProduct } from "../model/dbproduct"
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
import {authenticateJWT} from "./sellerAuthentication"
 
 
import {dbSeller} from "../model/sellerdb"
import { log } from "console";
const router = express.Router();
 
router.use(fileUpload())
 
 router.post("/add_product",authenticateJWT,addProductSchema,addProduct );
 router.put("/edit_product",authenticateJWT,editProductSchema,editProduct);
 router.get("/getAll_products",authenticateJWT,getSellerProducts) 
 //router.delete("/remove_product",removeProductSchema,removeProduct)
 
module.exports=router;
 
//Middleware for add_product request validat ion

function addProductSchema(req: any, res: any, next: any) {
 
    let schema = Joi.object ({
        product_name:Joi.string().min(2).trim().required(),
        product_ImageUrl:Joi.string().required(),
        product_category:Joi.string().min(2).trim().max(20).required(),
        product_price:Joi.number().min(0).required(),
        product_quantity:Joi.number().min(1).required(),
        product_description:Joi.string().trim().required()
    });

    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next,schema)) {
        return false;
    }

}

// Hander for add_product route

async function addProduct(req:any,res:any){

  // if (!req.files || Object.keys(req.files).length === 0) {
  //   return res.status(400).send('No files were uploaded.');
  // }

  
    const seller_id=req.seller_id;
    const {product_name,product_ImageUrl,product_category,product_price,product_quantity,product_description}=req.body;
    let data:any={seller_id,product_name,product_ImageUrl,product_category,product_price,product_quantity,product_description};
    let functionsObj = new functions();
    let productObj=new dbProduct();
    

    let result:any=await productObj.addProductdb(data);
    
    if (!result) {
       return res.send(functionsObj.output(500, 'An error occurred while adding the product.', null));
    }else {
      return  res.send(functionsObj.output(201, 'Product has been succesfully added.', result));
    }
}

 
// Midleware for edit_product request validation

function editProductSchema(req: any, res: any, next: any) {
 
    let schema = Joi.object ({
 
    product_id:Joi.number().required(),
   
    product_name:Joi.string().min(3).trim().optional(),
    product_category:Joi.string().min(3).max(20).trim().required().optional(),
    product_price:Joi.number().min(0).optional(),
    product_quantity:Joi.number().min(1).required().optional(),
    product_description:Joi.string().required().trim().optional()

  });

  let validationsObj = new validations();
   if (!validationsObj.validateRequest(req, res, next,schema)) {
    return false;
   }
}

// Handler for edit_product route 

async function editProduct(req:any,res:any){

// Extract data from the request

  const product_id:number=req.body.product_id;
  const data = req.body;
  const seller_id: number =req.seller_id;
  let functionsObj=new functions();

// List of fields that can be edited

  const editableFields = [
    "product_name",
    "product_category",
    "product_price",
    "product_quantity",
    "product_description"
  ];

// Prepare the update object with valid fields

  const validUpdate: any = {};
  for (const field of editableFields) {
    if (data[field] != undefined) {
      validUpdate[field] = data[field];
    }
  }

    let productObj=new dbProduct();
      
    // Check if the product exists
    let isProductExist:any=await productObj.isProductExist(product_id,seller_id);

    if(!isProductExist[0])  return res.send(functionsObj.output(404,"Product does not exist."));
     
    // Edit the product in the database
    let editedProduct:any=await productObj.editProductdb(product_id,validUpdate)

    if (!editedProduct) {
        res.send(functionsObj.output(500,"Internal server error.",null));
    } else {
        res.send(functionsObj.output(200, 'Product successfully edited.',editedProduct));
    } 
}
 

// Handler for edit_product route

async function  getSellerProducts(req:any,res:any){

    const seller_id:number=req.seller_id;
    
    let productObj=new dbProduct();
    let functionsObj=new functions();
    
    let products:any=await productObj. getSellerProductsdb(seller_id)
        
    if (!products[0]) {
        res.send(functionsObj.output(404, 'No products found for the provided seller.', null));
    } else {
        res.send(functionsObj.output(200, 'Products Have succesfully  fetched.',products));
    }
}

/*
// Middleware for validating removeProduct request validation

function removeProductSchema(req: any, res: any, next: any) {
 
    let schema= Joi.object ({
        id:Joi.number().min(1).required()
      });
       
     let validationsObj = new validations();
       if (!validationsObj.validateRequest(req, res, next,schema)) {
           return false;
       }
   }

// Handler for remove_product route

async function removeProduct (req: any, res: any)  {
       
    let product_id:number=req.body.product_id;
    let sellerObj=new dbProduct();
    let result:any=await sellerObj.removeProductdb(product_id)
     
    let functionsObj=new functions();
    if (!result) {
        res.send(functionsObj.output(404, 'Product not found.', null));
    } else {
        res.send(functionsObj.output(200, 'Product successfully removed.', result));
    }
     };
     
  
    */