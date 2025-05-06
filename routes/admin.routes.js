const express = require('express');
const { registerAdmin, loginAdmin, myProfile, changePassword, addManager,viewManagerById, viewAllManager,searchManager, deleteManager, activateManager,deactivateManager,updateManager,adminForgotPassword,adminResetPassword,updateAdminProfile ,deleteAdmin} = require('../controller/admin.controller');
const routes = express.Router();
const uploadImage = require("../middleware/uploadImage");
const { verifyAdminToken } = require('../middleware/verifyToken');

routes.post("/register", uploadImage.single('profileImage'), registerAdmin);
routes.post("/login", loginAdmin);   
routes.get("/profile", verifyAdminToken, myProfile); 

routes.post("/change-password", verifyAdminToken, changePassword);
routes.put('/update-profile', verifyAdminToken, uploadImage.single('profileImage'), updateAdminProfile);
routes.delete('/delete/:id', verifyAdminToken, deleteAdmin);
routes.post("/forgot-password", adminForgotPassword);
routes.post("/reset-password/:adminId", adminResetPassword);

routes.post("/add-manager", verifyAdminToken, uploadImage.single('profileImage'), addManager)
routes.get("/manager/:id", verifyAdminToken, viewManagerById);
routes.get("/view-manager", verifyAdminToken, viewAllManager);
routes.get("/search-manager", verifyAdminToken, searchManager);

routes.delete("/delete-manager/:id", verifyAdminToken, deleteManager);
routes.put("/activate-manager/:id", verifyAdminToken, activateManager);
routes.put("/deactivate-manager/:id", verifyAdminToken, deactivateManager);
routes.put('/update/:id', verifyAdminToken, updateManager);

module.exports = routes;