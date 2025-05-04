const jwt = require('jsonwebtoken');
const Admin = require("../model/admin.model");

const tokenVerify = async (req, res, next) => {
    // let token = req.headers['authorization'].split(" ")[1];
    let token = req.headers['authorization'].slice(7);
    // console.log(token);
    let {userID} = await jwt.verify(token, 'test')
    // console.log(userID)
    const admin = await Admin.findById(userID);
    if(admin){
        req.user = admin;
        next();
    }else{
        return res.json({message: "Invalid Token or User not Found"});
    }

};

module.exports = tokenVerify;