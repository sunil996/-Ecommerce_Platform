const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');


// genrate token for seller 
export const generateJWTToken = async (seller_id: number) => {

    const SECRET_KEY: any = process.env.SECRET_KEY;
    let genratedToken = await jwt.sign({seller_id}, SECRET_KEY);
  
    return genratedToken;
  };
  
  //authenticate seller token  
  
   export const authenticateJWT=async(req: any, res: any, next: any)=> {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ error: "Access denied. Token missing." });
    }
  
    const tokenWithoutPrefix = token.replace("Bearer ", "");
  
      try {
        const decoded = await jwt.verify(tokenWithoutPrefix,process.env.SECRET_KEY);
        const seller_id = decoded.seller_id;
        req.seller_id =seller_id;  
        
      next();
  
      } catch (error) {
        return res.status(403).json({ error: "Access denied." });
      }
    
  }

   // bcrypt password implementation
 

 export const passwordHashing=async(plainPassword:string)=>{
    
    const saltRounds = 10; 
 
    try {
        const hash = await bcrypt.hash(plainPassword, saltRounds);
        console.log("hash passwored-->"+hash);
        
        return hash;
      } catch (err) {
        console.error('Hashing error:', err);
        return null;
      }
      
 }
 

  
export async function performPasswordComparison(plainPassword:string,hash:any) {
  try {
    const isPasswordMatch = await bcrypt.compare(plainPassword, hash);
    console.log('Password matches:', isPasswordMatch);
    return isPasswordMatch;
  } catch (error) {
    return null;
  }
}

  
   