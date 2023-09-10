const bcrypt = require('bcrypt');
const saltRounds = 10; 
// Assuming you have a plain password from user input
const plainPassword = 'sunil';

bcrypt.hash(plainPassword, saltRounds, async (err:any, hash:any) => {
  if (err) {
    console.error('Hashing error:', err);
    return;
  }

  try {
    console.log('Hashed password:', hash);
 
   let results=await performPasswordComparison("sunil", hash);
   console.log("fdf");
   
   console.log(results);
   
  } catch (error) {
    console.error('Error:', error);
  }
});

 
async function performPasswordComparison(plainPassword:any, hash:any) {
  try {
    const isPasswordMatch = await bcrypt.compare(plainPassword, hash);
    console.log('Password matches:', isPasswordMatch);
  } catch (error) {
    console.error('Error comparing passwords:', error);
  }
}
