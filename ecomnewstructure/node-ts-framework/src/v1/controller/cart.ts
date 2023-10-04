import express from "express";
import Joi, { any } from "joi";
import { dbCart } from "../model/dbcart";
import { functions } from "../library/functions";
import { validations } from "../library/validations";
import { dbProduct } from "../model/dbproduct";
import {authenticateJwtForCustomer} from "./customerAuthenticaton"
import { dbOrders,dbOrderItems } from "../model/dborders";
import { dbSeller } from "../model/sellerdb";

import {sellerNotification} from "./notification"

let orderObj=new dbOrders(); 
let objOrderItem=new dbOrderItems();
let sellerObj=new dbSeller();
let functionObj=new functions();
const router=express.Router();
 
router.post("/addTocart",addToCartSchema,authenticateJwtForCustomer, addProductToCart);
router.delete("/removeFromcart",removeFromCartSchema,authenticateJwtForCustomer,removeFromCart);
router.get("/showCartItems",authenticateJwtForCustomer,showCartItems);
router.post("/bucketOrder",authenticateJwtForCustomer,bucketOrder);

//router.post("/placeOrder",singleOrderSchema,authenticateJwtForCustomer,SingleOrder)
/*
//router.post("/singleProduct__Place_order/:product_id", cartController.singleProductPlaceOrder);
router.post("/orders/:customer_id",  orderOfAllcartItems);

router.post("/orders_details/:customer_id", showOrderFullDetails);
router.post("/place_Order_Of_AllCartItems/:customer_id", cartController.PlaceOrderOfAllCartItems);
  
*/
module.exports = router;

let validationsObj = new validations();
let productObj=new dbProduct();
let cartObj=new dbCart();
let functionsObj = new functions();

function addToCartSchema(req: any, res: any, next: any) {

    let schema = Joi.object({
      product_id: Joi.number().min(1).required(),
      quantity:Joi.number().min(1).default(1) 
    } )

    if (!validationsObj.validateRequest(req, res, next, schema)) {
      return false;
    }
  } 

async function addProductToCart  (req: any, res: any)  {

    let customer_id=req.customer_id;
    let {product_id,quantity} = req.body;
    let data: any = {

        product_id, 
        customer_id, 
        quantity
    };

     let isProductExist=await productObj.checkProductExistence(product_id);

     if(!isProductExist[0])
     {
      return res.send(functionsObj.output(400, "Product not found",null));
     }

     let isProductadded:any=await cartObj.checkProductInCart(product_id,customer_id) ;
     
     if(isProductadded[0])
     {
      console.log(isProductadded[0]);
      
       let countOfProduct:number=isProductadded[0].quantity+1;
       let updateCart:any=await cartObj.updateCartQuantity(product_id,countOfProduct,customer_id);
       if(!updateCart)
       {
         return 
       }  
        return   res.send(functionsObj.output(200, "Cart updated successfully."));
    }
     let result=await cartObj.addToCartdb(data)
     if(!result){
        return res.send(functionsObj.output(500, "Product has not aded into cart."));
    }else{
        return res.send(functionsObj.output(200, "Product added into the cart."));
    }
    
  }; 

// remove product from the cart ..

function removeFromCartSchema(req: any, res: any, next: any) {

  let schema = Joi.object({
    product_id: Joi.number().min(1).required() 
  })

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
} 

  async function removeFromCart(req: any, res: any){

  let customer_id=req.customer_id;
  let {product_id} = req.body;

  let result=await cartObj.checkProductInCart(product_id,customer_id);
  
  if(!result)
  {
      return res.send(functionsObj.output(400, "Product is not in your cart."));
  }

  let isProductRemove=await cartObj.removeFromCartctdb(product_id);
  if(!isProductRemove)
  {
      return res.send(functionsObj.output(500, "Product is not remove from your cart."));
  }else{
    return res.send(functionsObj.output(200,"product removed from cart",isProductRemove))
  }

}

// show all the items of cart 

async function showCartItems(req:any,res:any)
{
  let customer_id:number=req.customer_id;
  let result:any=await cartObj.showCartItems(customer_id);

  if(!result)
  {
    return res.send(functionsObj.output(404,"message:product are not added in the cart. ",null))
  }
  return res.send(functionsObj.output(200,"success",result))
}
//

// placeOrder from the cart.

async function bucketOrder(req:any,res:any)
{

  
  console.log(req.customer_id);
  
   let customer_id:number=req.customer_id;
   let checkCart= await cartObj.checkCart(customer_id);
   console.log(checkCart[0]);
   
   if(!checkCart[0])
   {
    return res.send(functionObj.output(200,"Your cart is empty.",null))
   }
   let total_amount: number = 0;
   let productQuantity: number = 0;
   let resultOfCart:any=await cartObj.showCartItems(customer_id);
  // console.log(resultOfCart);
   
   for (let row of resultOfCart)
   {
    const {quantity,product_price}=row;
    let amount:number=quantity*product_price;               
    total_amount=amount+total_amount;

   }
   let orderData= await  orderObj.singleOrder({customer_id:customer_id,total_amount});
    
   for (let row of resultOfCart)
   {
    const {product_id,quantity,product_price}=row;
    let amount:number=quantity*product_price;               
    
    await objOrderItem.singlOrderItem({order_id:orderData,product_id,quantity,item_price:product_price,amount})
    const  productDetails  = await productObj.checkProductExistence(product_id);
    const seller_id:number=productDetails[0].seller_id;
    const sellerData:any=await sellerObj.getSellerMail(seller_id);
    const sellerEmail=sellerData[0].seller_email;

    console.log(sellerEmail);
    
    sellerNotification(sellerEmail);
    
  }
  cartObj.clearCartdb(customer_id);

  return res.send(functionObj.output(200,"order of all the cart items have placed."))

}

//whole order 

