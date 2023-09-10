import { appdb } from "./appdb";

export class dbCustomer extends appdb {
    constructor() {
        super();
        this.table = 'customers';
        this.uniqueField = 'id';
    }

// Create a new account of Customer 

    async customerSignUpdb(customer_data:any){
       
         let results:any=await this.insertRecord(customer_data)
         return results;  
     }

//fetch customer password based on email (we have used this function while customer login thier account.)

  async getCustomerDetailsdb(customer_email:string){
 
    this.where = `where customer_email='${customer_email}'`;
    let results: any = await this.allRecords(`id,customer_name,customer_email,customer_password,customer_address,customer_phone,customer_bankacc`);
    return results;
   }
  

// Update Customer information  

   async editCustomerDetailsdb(customer_id:number,customer_data:any){

        let results:any=await this.updateRecord(customer_id,customer_data)
        return results;
     }
    
  // Check for unique values in specific fields.
 
  async checkUniqueFieldsdb(field:string,value:string){
 
     let field1=field;
     this.where=`where ${field1}='${value}'`;
     let result:any=await this.allRecords(field)
     return result
  }

// get Customer password based on their id 

async fetchCustomerPassworddb(customer_id:number){

  this.where=`where id='${customer_id}'`
  let result:any=await this.allRecords(`customer_password`);
  return result
}
 

}