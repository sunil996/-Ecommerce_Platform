import express from "express";
import Joi, { func, object, valid } from "joi";
import { functions } from "../library/functions";
import { validations } from "../library/validations";
import { dbCustomer } from "../model/dbcustomer";
const jwt = require("jsonwebtoken");
import {generatetokenForCustomer,authenticateJwtForCustomer} from "./customerAuthenticaton"
import {passwordHashing,performPasswordComparison} from "./sellerAuthentication"

const router=express.Router();