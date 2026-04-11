const routers = require("express").Router();

const{login,signup} = require("../controllers/authController");
routers.post("/login",login);
routers.post("/signup",signup);
module.exports = routers;