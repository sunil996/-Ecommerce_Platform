const express = require("express");
const app = express();
const port = 5000; 
const multipart = require("connect-multiparty");
const { log } = require("console");

app.use(multipart());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(multipart()) 

app.post("/submit", (req, res) => {
  const formData = req.body;
  console.log("file "+req.body.file.buffer);
  console.log(formData.product_image);
  res.json(formData);
});

app.post("/submit1", (req, res) => {
    // Access the product_name value and remove the extra quotes
    const product_name = req.body.product_name.replace(/"/g, '');
    
    console.log("Product Name:", product_name);
    
    // Respond with the processed product name
    res.json({ product_name });
  });
  
app.listen(port, () => {
  console.log(`Server is listening on port no: ${port}`);
});
 