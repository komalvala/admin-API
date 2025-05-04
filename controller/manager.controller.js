const nodemailer = require('nodemailer'); 
const Manager = require("../models/manager.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registermanager = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender } = req.body;
    let imagePath = "";
    let manager = await Manager.findOne({ email: email, isDelete: false });
    if (manager) {
      return res.status(400).json({ message: "Manager Already Exist" });
    }

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    let hashPassword = await bcrypt.hash(password, 10);
    manager = await Manager.create({
      firstname,
      lastname,
      email,
      password: hashPassword,
      gender,
      profileImage: imagePath,
    });

    return res.status(201).json({ message: "Admin Register Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.loginManager = async (req, res) => {
     try {
    const { email, password } = req.body;
    let manager = await Manager.findOne({ email: email, isDelete: false });
    if (!manager) {
      return res.status(404).json({ message: "Manager not found." });
    }

    let matchPass = await bcrypt.compare(password, manager.password);
    if (!matchPass) {
      return res.status(400).json({ message: "Password is not matched" });
    }
    let payload = {
      managerId: manager._id,
    };
    let token = await jwt.sign(payload, "manager");
    return res
      .status(200)
      .json({ message: "Manager Login Success", managerToken: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.myProfile = async (req, res) => {
  try {
    let manager = req.user;
    return res.status(200).json({ message: "Profile Success", data: manager });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { current_pass, new_pass, confirm_pass } = req.body;
    let manager = req.user;

    console.log("Current password:", current_pass);
    console.log("manager password:", manager?.password);

    let matchPass = await bcrypt.compare(current_pass, manager.password);
    if (!matchPass) {
      return res
        .status(400)
        .json({ message: "Current password is not matched" });
    }

    if (current_pass === new_pass) {
      return res
        .status(400)
        .json({ message: "Current and new password are the same" });
    }

    if (new_pass !== confirm_pass) {
      return res
        .status(400)
        .json({ message: "New and confirm password do not match" });
    }

    let hashPassword = await bcrypt.hash(new_pass, 10);
    manager = await Manager.findByIdAndUpdate(
      manager._id,
      { password: hashPassword },
      { new: true }
    );

    return res.status(200).json({ message: "Password change success" });
  } catch (error) {
    console.log("Change Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

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

exports.managerForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const manager = await Manager.findOne({ email });
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    const resetLink = `http://localhost:3000/manager/reset-password/${manager._id}`;

    await transporter.sendMail({
      to: email,
      subject: "Manager Reset Password",
      html: `<p>Reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    });

    res.status(200).json({ message: "Reset link sent to Manager's email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.managerResetPassword = async (req, res) => {
  try {
    const { managerId } = req.params;
    const { new_pass, confirm_pass } = req.body;

    if (new_pass !== confirm_pass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const hashedPassword = await bcrypt.hash(new_pass, 10);
    manager.password = hashedPassword;
    await manager.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Manager Reset Password Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};