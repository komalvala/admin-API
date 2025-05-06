const express = require('express');
const routes = express.Router();
const uploadImage = require("../middleware/uploadImage");
const { verifyEmployeeToken } = require("../middleware/verifyEmployeeToken");
const {
  registerEmployee,
  loginEmployee,
  employeeProfile,
  changeEmployeePassword,
  viewAllEmployee,
  deleteEmployee,
  activateEmployee,
  deactivateEmployee,
  employeeForgotPassword,
  employeeResetPassword,
  logoutEmployee
} = require("../controller/employee.controller");

routes.post("/register", uploadImage.single('profileImage'), registerEmployee);
routes.post("/login", loginEmployee);
routes.get("/profile", verifyEmployeeToken, employeeProfile);
routes.post("/change-password", verifyEmployeeToken, changeEmployeePassword);
routes.get("/view-employee", verifyEmployeeToken, viewAllEmployee);
routes.delete("/delete-employee/:id", verifyEmployeeToken, deleteEmployee);
routes.put("/activate-employee/:id", verifyEmployeeToken, activateEmployee);
routes.put("/deactivate-employee/:id",verifyEmployeeToken , deactivateEmployee);
routes.post("/forgot-password", employeeForgotPassword);
routes.post('/reset-password/:employeeId', employeeResetPassword);
routes.post('/logoutemployee',  logoutEmployee);


module.exports = routes;
