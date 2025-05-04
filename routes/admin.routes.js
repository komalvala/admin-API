const express = require('express');
const { registerAdmin, loginAdmin, myProfile, changePassword, addManager, viewAllManager, deleteManager, activateManager,adminForgotPassword,adminResetPassword } = require('../controller/admin.controller');
const routes = express.Router();
const uploadImage = require("../middleware/uploadImage");
const { verifyAdminToken } = require('../middleware/verifyToken');

routes.post("/register", uploadImage.single('profileImage'), registerAdmin);

routes.post("/login", loginAdmin);   

routes.get("/profile", verifyAdminToken, myProfile); 

routes.post("/change-password", verifyAdminToken, changePassword);

routes.post("/add-manager", verifyAdminToken, uploadImage.single('profileImage'), addManager)
routes.get("/view-manager", verifyAdminToken, viewAllManager)
routes.delete("/delete-manager/:id", verifyAdminToken, deleteManager);
routes.put("/activate-manager/:id", verifyAdminToken, activateManager);
routes.post("/forgot-password", adminForgotPassword);
routes.post("/reset-password/:adminId", adminResetPassword);

module.exports = routes;