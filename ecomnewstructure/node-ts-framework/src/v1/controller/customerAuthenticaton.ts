const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');


// genrate token for Customer 

export const generatetokenForCustomer = async (customer_id: number) => {

    const SECRET_KEY: any = process.env.SECRET_KEY;
    let genratedToken = await jwt.sign({customer_id}, SECRET_KEY);
  
    return genratedToken;
  };
  
  //authenticate seller token  
  
   export const authenticateJwtForCustomer=async(req: any, res: any, next: any)=> {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ error: "Access denied. Token missing." });
    }
  
    const tokenWithoutPrefix = token.replace("Bearer ", "");
  
      try {
        const decoded = await jwt.verify(tokenWithoutPrefix,process.env.SECRET_KEY);
        const customer_id = decoded.customer_id;
        req.customer_id =customer_id;  
        
        if(!customer_id)
        {
          return res.status(400).json({ error: "net Getting customer_id from the token." });
        }
      next();
  
      } catch (error) {
        return res.status(403).json({ error: "Access denied." });
      }
    
  }
