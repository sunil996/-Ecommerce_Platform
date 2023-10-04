 
import { appdb } from "./appdb";

export class dbSeller extends appdb {
    constructor() {
        super();
        this.table = 'sellers';
        this.uniqueField = 'id';
    }

// Register a new seller in the database.

     async sellerSignUpdb(seller_data:any){
        let results:any=await this.insertRecord(seller_data)
        return results;
     }

//fetch seller password based on seller_email  ( used while seller login their account) 

  async getSellerDetails(seller_email:string){
 
    this.where = `where seller_email='${seller_email}'`;
    let results: any = await this.allRecords(`id,seller_name,seller_email,seller_password,seller_address,seller_bankacc,seller_phone`);
    return results;
   }
  

// Update seller information in the database.

   async editSellerDetailsdb(seller_id:number,seller_data:any){

        let results:any=await this.updateRecord(seller_id,seller_data)
        return results;
     }
    
  // Check for unique values in specific fields.
 
  async checkUniqueFields(field:string,value:string){
 
     let field1=field;
     this.where=`where ${field1}='${value}'`;
     let result:any=await this.allRecords(field)
     return result
  }

// get seller password 

async fetchSellerPassword(seller_id:number){

  this.where=`where id='${seller_id}'`
  let result:any=await this.allRecords(`seller_password`);
  return result
}

async getSellerMail(seller_id:number)
{
 this.where=`where id='${seller_id}'`
 let results:any=await this.allRecords("seller_email");
 return results;
}

async showSellerOrders(seller_id:number)
{
   let field:string=`oi.id as order_item_id,p.id as product_id,p.product_name,p.product_imageUrl,p.product_category,oi.quantity,oi.item_price,oi.amount,oi.order_status`
   let where:string=`inner join 
                     order_items as oi on orders.id=oi.id
                     inner join 
                     products as p on oi.product_id=p.id
                     where p.seller_id='${seller_id}'
                    `;
   let results:any=await this.select("orders",field,where,"order by  orders.id","limit 100");
   console.log(results);
   
   return results;
}
 
}
 
