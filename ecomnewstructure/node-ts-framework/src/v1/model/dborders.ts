  
import { appdb } from "./appdb";

export class dbOrders extends appdb {
    constructor() {
        super();
        this.table = 'orders';
        this.uniqueField = 'id';
    }
   

  async singleOrder(orderData:any)
  {
    console.log("in single order");
    let results:any=await this.insertRecord(orderData);
    return results;
  }
 
  async singlOrderItem(orderData:any)
  {
    let results:any=await this.insertRecord(orderData);
    return results;
  }
  

}


export class dbOrderItems extends appdb {
  constructor() {
      super();
      this.table = 'order_items';
      this.uniqueField = 'id';
  }
 

async singlOrderItem(orderData:any)
{
  let results:any=await this.insertRecord(orderData);
  return results;
}


async updateOrderStatus(order_id:number,order_status:string)
{
  let results:any=await this.updateRecord(order_id,{order_status})
  return results;
}



}