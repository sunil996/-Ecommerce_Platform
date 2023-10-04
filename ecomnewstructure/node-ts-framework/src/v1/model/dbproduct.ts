import { appdb } from "./appdb";

export class dbProduct extends appdb {
    constructor() {
        super();
        this.table = 'products';
        this.uniqueField = 'id';
    }

// Add a new product to the database.
 
    async addProductdb(product_data:any){
        let results:any=await this.insertRecord(product_data)
        return results;
     }

// Update product information in the database.

     async editProductdb(product_id:number,product_data:any){

         let results:any=await this.updateRecord(product_id,product_data);
         return results;
     }

// Fetch all products associated with a seller from the database.

     async  getSellerProductsdb(seller_id:number){
        
        this.where=`where seller_id=${seller_id}`;
        this.orderby=`order by id asc`;
        let results:any=await this.allRecords();
        return results;
    }
 
// Check if a product exists for a specific seller. 

    async isProductExist(product_id:number,seller_id:number) {
    
      this.where=`where id='${product_id}' and seller_id='${seller_id}'` ;
      let results:any=await this.allRecords("id,seller_id");
      return results;
    }

    async checkProductExistence(product_id:number) {
    
      this.where=`where id='${product_id}' ` ;
      let results:any=await this.allRecords("id,seller_id,product_price");
      console.log(results);
      
      return results;
    }

   searchProductdb= async (keyword:any) => {
    
    this.where=`where product_name like '${keyword}%'`
    let results:any=await this.allRecords( );
    return results;
   }
    
}

 


