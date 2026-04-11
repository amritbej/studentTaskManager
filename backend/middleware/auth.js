const jwt = require("jsonwebtoken");

module.exports = function(req,res,next){
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : req.header("token");

    if(!token){
        return res.status(401).json({ message: "Authentication token is required." });
    }

    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
        req.user = verified.user;
        next();
    }catch(err){
        res.status(400).json({ message: "Invalid authentication token." });
    }

};
