const Employee = require('../models/employee.model');
const jwt = require('jsonwebtoken');

exports.verifyEmployeeToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, 'employee');

    console.log("Decoded Token:", decoded);

    if (!decoded.employeeId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.employee = { id: decoded.employeeId }; 
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
