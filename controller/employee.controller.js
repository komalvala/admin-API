const nodemailer = require('nodemailer'); 
const Employee = require("../models/employee.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerEmployee = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender } = req.body;
    let imagePath = "";

    let employee = await Employee.findOne({ email, isDelete: false });
    if (employee) return res.status(400).json({ message: "Employee Already Exist" });

    if (req.file) imagePath = `/uploads/${req.file.filename}`;
    let hashPassword = await bcrypt.hash(password, 10);

    employee = await Employee.create({
      firstname,
      lastname,
      email,
      password: hashPassword,
      gender,
      profileImage: imagePath,
    });

    res.status(201).json({ message: "Employee Register Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    let employee = await Employee.findOne({ email, isDelete: false });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    let match = await bcrypt.compare(password, employee.password);
    if (!match) return res.status(400).json({ message: "Password is not matched" });

    let token = jwt.sign({ employeeId: employee._id }, "employee");
    res.status(200).json({ message: "Login Success", employeeToken: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.employeeProfile = async (req, res) => {
  try {
    let employee = req.employee; 
    return res.status(200).json({ message: "Profile Success", data: employee });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.logoutEmployee = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


exports.changeEmployeePassword = async (req, res) => {
  try {
    const { current_pass, new_pass, confirm_pass } = req.body;
    const decodedEmployee = req.employee;

    const employee = await Employee.findById(decodedEmployee.id);

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const match = await bcrypt.compare(current_pass, employee.password);
    if (!match) return res.status(400).json({ message: "Current password is not matched" });

    if (current_pass === new_pass) return res.status(400).json({ message: "Current and new password are the same" });
    if (new_pass !== confirm_pass) return res.status(400).json({ message: "New and confirm password do not match" });

    const hashPassword = await bcrypt.hash(new_pass, 10);
    await Employee.findByIdAndUpdate(employee._id, { password: hashPassword });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.viewAllEmployee = async (req, res) => {
  try {
    let employees = await Employee.find({ isDelete: false });
    res.cookie("hello", "admin");
    res.cookie("hello1", "admin");
    return res
      .status(200)
      .json({ message: "All Employees Fetched Successfully", data: employees });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    let id = req.params.id;
    let employee = await Employee.findOne({ _id: id, isDelete: false });
    if (!employee) {
      return res.status(404).json({ message: "Employee Not Found" });
    }
    await Employee.findByIdAndUpdate(
      id,
      { isDelete: true },
      { new: true }
    );
    return res.status(200).json({ message: "Employee Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.activateEmployee = async (req, res) => {
  try {
    let id = req.params.id;
    let employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee Not Found" });
    }
    if (employee.isDelete == false) {
      return res.status(400).json({ message: "Employee Already Activated" });
    }
    await Employee.findByIdAndUpdate(
      id,
      { isDelete: false },
      { new: true }
    );
    return res.status(200).json({ message: "Employee Activated Successfully" });
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

exports.employeeForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const resetLink = `http://localhost:3000/employee/reset-password/${employee._id}`;

    await transporter.sendMail({
      to: email,
      subject: "Employee Reset Password",
      html: `<p>Reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    });

    res.status(200).json({ message: "Reset link sent to Employee's email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.employeeResetPassword = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { new_pass, confirm_pass } = req.body;

    if (new_pass !== confirm_pass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const hashedPassword = await bcrypt.hash(new_pass, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Employee Reset Password Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};