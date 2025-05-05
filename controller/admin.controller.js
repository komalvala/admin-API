const nodemailer = require('nodemailer'); 
const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Manager = require("../models/manager.model");
const { sendMail } = require("../config/mailconfig");

exports.registerAdmin = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender } = req.body;
    let imagePath = "";
    let admin = await Admin.findOne({ email: email, isDelete: false });
    if (admin) {
      return res.status(400).json({ message: "Admin Already Exist" });
    }

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    let hashPassword = await bcrypt.hash(password, 10);
    admin = await Admin.create({
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

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let admin = await Admin.findOne({ email: email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    let matchPass = await bcrypt.compare(password, admin.password);
    if (!matchPass) {
      return res.status(400).json({ message: "Password is not matched" });
    }
    let payload = {
      adminId: admin._id,
    };
    let token = await jwt.sign(payload, "admin");
    return res
      .status(200)
      .json({ message: "Admin Login Success", adminToken: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.myProfile = async (req, res) => {
  try {
    let admin = req.user;
    return res.status(200).json({ message: "Profile Success", data: admin });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    if (req.file) {
      const admin = await Admin.findById(req.user.id);
      
      if (admin && admin.profilePicture !== 'default-profile.jpg') {
        const oldPicturePath = path.join('uploads/profile-pictures', admin.profilePicture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
      
      updateFields.profilePicture = req.file.filename;
    }

    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!admin) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { current_pass, new_pass, confirm_pass } = req.body;
    let admin = req.user;

    console.log("Current password:", current_pass);
    console.log("Admin password:", admin?.password);

    let matchPass = await bcrypt.compare(current_pass, admin.password);
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
    admin = await Admin.findByIdAndUpdate(
      admin._id,
      { password: hashPassword },
      { new: true }
    );

    return res.status(200).json({ message: "Password change success" });
  } catch (error) {
    console.log("Change Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    await admin.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.addManager = async (req, res) => {
  try {
    let { firstname, lastname, email, password, gender, profileImage } =
      req.body;
    let manager = await Manager.findOne({ email: email, isDelete: false });

    if (manager) {
      return res.status(400).json({ message: "Manager already exist" });
    }

    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }
    let hashPassword = await bcrypt.hash(password, 10);

    manager = await Manager.create({
      firstname,
      lastname,
      email,
      gender,
      password: hashPassword,
      profileImage,
    });
    await sendMail(email, password);
    return res.status(201).json({ message: "New Manager Added Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.viewAllManager = async (req, res) => {
  try {
    let managers = await Manager.find({ isDelete: false });
    res.cookie("hello", "admin");
    res.cookie("hello1", "admin");
    return res
      .status(200)
      .json({ message: "All Manager Fetch Success", data: managers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateManager = async (req, res) => {
  try {
    const { name, email, department, contactNumber, active } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (department) updateFields.department = department;
    if (contactNumber) updateFields.contactNumber = contactNumber;
    if (active !== undefined) updateFields.active = active;

    const manager = await Manager.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    res.status(200).json({
      success: true,
      data: manager
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.deleteManager = async (req, res) => {
  try {
    let id = req.params.id;
    let manager = await Manager.findOne({ _id: id, isDelete: false });
    if (!manager) {
      return res.status(404).json({ message: "Manager Not Found" });
    }
    manager = await Manager.findByIdAndUpdate(
      id,
      { isDelete: true },
      { new: true }
    );
    return res.status(200).json({ message: "Delete Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.activateManager = async (req, res) => {
  try {
    let id = req.params.id;
    let manager = await Manager.findById(id);
    if(!manager){
      return res.status(404).json({ message: "Manager Not Found" });
    }
    if(manager.isDelete == false){
      return res.status(404).json({ message: "Manager already Activated" });
    }
    manager = await Manager.findByIdAndUpdate(
      id,
      { isDelete: false },
      { new: true }
    );
    return res.status(200).json({ message: "Manager is Activated Success" });
  } catch (error) {
    console.log(error);
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

exports.adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const resetLink = `http://localhost:3000/admin/reset-password/${admin._id}`;

    await transporter.sendMail({
      to: email,
      subject: "Admin Reset Password",
      html: `<p>Reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    });

    res.status(200).json({ message: "Reset link sent to Admin's email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.adminResetPassword = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { new_pass, confirm_pass } = req.body;

    if (new_pass !== confirm_pass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const hashedPassword = await bcrypt.hash(new_pass, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// https://github.com/pateljenish9878/API-NodeJs 
