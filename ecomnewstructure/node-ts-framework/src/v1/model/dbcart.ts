import { log } from "console";
import { appdb } from "./appdb";

export class dbCart extends appdb {
    constructor() {
        super();
        this.table = 'cart';
        this.uniqueField = 'id';
    }

// Create a new account of Customer 

    async addToCartdb(data:any){
       
         let results:any=await this.insertRecord(data)
         return results;  
     }

     async checkProductInCart(product_id:number,customer_id:number){
       
        this.where=`where product_id='${product_id}' and customer_id='${customer_id}'`;
        let results:any=await this.allRecords('product_id,customer_id,quantity');
        return results;
     }
 
      async updateCartQuantity(product_id:number,quantity:number,customer_id:number)
      {
         console.log("cart quantity"+quantity);
         
         let results=await this.update("cart",{"quantity":quantity},`where  product_id='${product_id}' and customer_id='${customer_id}'`);
         return results;
      }

     async   removeFromCartctdb(product_id:number){
       
        let results:any=await this.delete("cart",`where product_id='${product_id}'`);
        return results;
     }

     async showCartItems(customer_id:number)
     { 

       let field:string=`cart.id,cart.product_id,p.product_name,p.product_ImageUrl,p.product_price,cart.quantity,p.product_description`;
       let results:any=await  this.select("cart",field, ` inner join products as p ON cart.product_id = p.id where cart.customer_id='${customer_id}'`,
       "order by cart.id ","limit 50");   
        return  results;
     }

//fetch customer password based on email (we have used this function while customer login thier account.)

  async getCustomerDetailsdb(customer_email:string){
 
    this.where = `where customer_email='${customer_email}'`;
    let results: any = await this.allRecords(`id,customer_name,customer_email,customer_password,customer_address,customer_phone,customer_bankacc`);
    return results;
   }

// remove products from the cart.

  async clearCartdb(customer_id:number){
 
    let where:string = `where customer_id='${customer_id}'`;
    let table:string="cart";
    let results:any=await this.delete(table,where)
    return results;

   }

   //this function used for checking that customer has empty cart or not ?
  async checkCart(customer_id:number){
   
    this.where=`where customer_id='${customer_id}'`
    let results:any=await this.allRecords()
    console.log(results);
    
    return results;

   }
 

}