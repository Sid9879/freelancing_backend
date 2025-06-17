const jwt = require ('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

const authMiddleware =(req,res,next)=>{
   const token = req.cookies.token;
   if(!token){
         return res.status(401).json({message: "No token provided. Please log in again"});
   };
   try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.user = decoded;
    next();
   } catch (error) {
    res.status(500).json({message: "Your session has expired or token is invalid. Please log in again.",error: error.message});
   }
}


const roleCheck = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized, user not logged in' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: `Access denied: ${requiredRole} role required` });
    }

    next();
  };
};



const me = (req,res)=>{
   res.json({
    success: true,
    user: {
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  }); 
}
module.exports = {authMiddleware,
me,
roleCheck
}
