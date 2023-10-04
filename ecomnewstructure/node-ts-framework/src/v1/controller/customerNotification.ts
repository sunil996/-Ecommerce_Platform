
import nodemailer from 'nodemailer';

export const sellerNotification = (customer_email:string)=>{

 const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sunilshekhawat772@gmail.com",
      pass: "rtdk ljjh xywo aead",
    },
  });
    
  const mailOptions = {
    from: "sunilshekhawat772@gmail.com",
    to:customer_email,
    subject: "Order Notification ",
    text: "Your order has shipped by seller ...",
  };

  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}