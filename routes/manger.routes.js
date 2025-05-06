const express = require('express');
const routes = express.Router();
const uploadImage = require("../middleware/uploadImage");
const { verifyManagerToken } = require('../middleware/verifyToken');
const {registermanager, loginManager, myProfile ,changePassword,managerForgotPassword,managerResetPassword,logoutManager,addEmployee,viewAllEmployee,viewEmployeeById,searchEmployee,updateEmployee} = require('../controller/manager.controller');

routes.post("/register", uploadImage.single('profileImage'), registermanager);
routes.post("/login", loginManager);   
routes.get("/profile", verifyManagerToken, myProfile); 
routes.post("/change-password", verifyManagerToken, changePassword);
routes.post("/forgot-password", managerForgotPassword);
routes.post('/reset-password/:managerId', managerResetPassword);
routes.post('/managerlogout',  logoutManager);
routes.post("/addemployee", verifyManagerToken,addEmployee);
routes.get("/viewAllEmployee", verifyManagerToken,viewAllEmployee);
routes.get("/employee/:id", verifyManagerToken, viewEmployeeById);
routes.get("/search-employee", verifyManagerToken, searchEmployee);
routes.put("/employeeupdate/:id",verifyManagerToken, updateEmployee);


module.exports = routes;