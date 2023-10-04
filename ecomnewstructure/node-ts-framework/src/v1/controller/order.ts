
import { dbProduct } from "../model/dbproduct";
import { dbOrders,dbOrderItems } from "../model/dborders";
import express from "express";
import {authenticateJwtForCustomer} from "./customerAuthenticaton"
import { functions } from "../library/functions";
import { validations } from "../library/validations";
import Joi from "joi";
import {dbSeller} from "../model/sellerdb"
import {sellerNotification} from "./notification"
import { log } from "console";

let orderObj=new dbOrders();
let productObj=new dbProduct();
let functionObj=new functions();
let validationsObj=new validations();
let sellerObj=new dbSeller();
let objOrderItem=new dbOrderItems();

const router=express.Router();
 
router.post("/singleOrder",singleOrderSchema,authenticateJwtForCustomer,SingleOrder);
/*
router.post("/orders/:customer_id",  orderOfAllcartItems);

router.post("/orders_details/:customer_id", showOrderFullDetails);
router.post("/place_Order_Of_AllCartItems/:customer_id", cartController.PlaceOrderOfAllCartItems);
  
*/
module.exports = router;

function singleOrderSchema(req: any, res: any, next: any) {

    let schema = Joi.object({
      product_id: Joi.number().min(1).required(),
      quantity:Joi.number().default(1).max(100)
    } )
  
    if (!validationsObj.validateRequest(req, res, next, schema)) {
      return false;
    }
  } 
  
async function SingleOrder(req:any,res:any)
{
   
   const customer_id:number=req.customer_id;
   const {product_id,quantity}=req.body;
   const  productDetails  = await productObj.checkProductExistence(product_id);
   if(!productDetails[0])
   {
    return res.send(functionObj.output(400,"No products  found ",null))
   }
   const seller_id:number=productDetails[0].seller_id;
   const priceOfProduct:number=productDetails[0].product_price;
   const totalPrice:number=priceOfProduct*quantity;
   const sellerData=await sellerObj.getSellerMail(seller_id);
 
   const seller_emai:string=sellerData[0].seller_email;
   
   const orderData:any={customer_id:customer_id,total_amount:totalPrice}
   let orderid:number=await orderObj.singleOrder(orderData);
   
   let orderItemData={order_id:orderid,product_id,quantity,item_price:priceOfProduct,amount:totalPrice}
   let result:any=await objOrderItem.singlOrderItem(orderItemData)
   
   sellerNotification(seller_emai);
   return res.send(functionObj.output(200,"Order has placed",result))
    
}