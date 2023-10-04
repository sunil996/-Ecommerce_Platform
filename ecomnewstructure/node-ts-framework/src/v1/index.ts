import express from "express";
import Joi from "joi";
import { validations } from "./library/validations";

const router = express.Router();
let sellerRouter=require('./controller/seller')
let productRouter=require("./controller/product")
let customerRouter=require("./controller/customer");
let cartRouter=require("./controller/cart");
let orderRouter=require("./controller/order")
/*
 * Primary app routes.
 */

router.use('/seller',sellerRouter);
router.use("/product",productRouter);
router.use("/customer",customerRouter) 
router.use("/cart",cartRouter)
router.use("/order",orderRouter);

module.exports = router;