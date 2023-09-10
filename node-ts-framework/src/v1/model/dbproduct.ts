import { appdb } from "./appdb";

export class dbproduct extends appdb {
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

//   remove a product from the database

     async removeProductdb(product_id:number){

        let results:any=await this.deleteRecord(product_id)
        return results;
    } 

// Check if a product exists for a specific seller.

    async isProductExist(product_id:number,seller_id:number) {
    
      this.where=`where id='${product_id}' and seller_id='${seller_id}'` ;
      let results:any=await this.allRecords("id,seller_id");
      return results;
    }
    
}

 


