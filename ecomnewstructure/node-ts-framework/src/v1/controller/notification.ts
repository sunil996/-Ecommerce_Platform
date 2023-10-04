
import nodemailer from 'nodemailer';

export const sellerNotification = (seller_email:string)=>{

 const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sunilshekhawat772@gmail.com",
      pass: "rtdk ljjh xywo aead",
    },
  });
   

  const mailOptions = {
    from: "sunilshekhawat772@gmail.com",
    to: seller_email,
    subject: "Order Notification ",
    text: "user has placed a order of your item.",
  };

  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}