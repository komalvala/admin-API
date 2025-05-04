const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false, 
  auth: {
    user: 'kvala8087@gmail.com',
    pass: 'eipulfwaakaphpnb', 
  },
  tls: {
    rejectUnauthorized: false 
  }
});

exports.sendMail = async function (receiverEmail, password) {
  try {
    const info = await transporter.sendMail({
      from:  'kvala8087@gmail.com', 
      to: `${receiverEmail}`,
      subject: "Reset Password OTP ✔",
      text: `Your reset password OTP is: ${password}`,
      html: `<h3>Hello,</h3>
             <p>Your reset password is: <strong>${password}</strong></p>
             <p>This OTP is valid for 5 minutes.</p>
             <p>If you didn't request this, ignore this email.</p>`,
    });

    console.log("OTP email sent successfully to:", receiverEmail);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};