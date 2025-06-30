const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
 const { validationResult } = require('express-validator');
 const sendContactMail = require('../utils/sendContactMail');
 const passport = require('passport')

const registerUser = async(req,res)=>{
    const {name,role,email,password,phone}= req.body;
   try {
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success: false });
  }
     let existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      const conflictField = existingUser.email === email ? 'Email' : 'Phone number';
      return res.status(400).json({ message: `${conflictField} already exists`, success: false });
    }
      const hashedPassword = await bcrypt.hash(password,8);
      const user = await User.create({
        name,
        role,
        email,
        password: hashedPassword,
        phone,
      })
      res.status(201).json({message: "User registered successfully", success: true});
   } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error", error:error.message, success: false});
   }
}
const LoginUSer = async(req,res)=>{
    const {email,password} = req.body;
    try {
        if(!email||!password){
            return res.status(400).json({message: "Please provide email and password", success: false});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid email or password", success: false});
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid email or password", success: false});
        }
         const token = jwt.sign({_id:user._id,email:user.email,role:user.role},process.env.JWT_SECRET, {expiresIn: '1d'});
         res.cookie("token",token,{
           httpOnly: true,
  secure: true,   
  sameSite: 'None',
  maxAge: 24 * 60 * 60 * 1000
         })
        res.status(200).json({message: "Login successful", success: true});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error", success: false});
        
    }
}

const getSingleUser = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found", success: false});
        }
        res.status(200).json({user, success: true});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error", success: false});
    }
}

const logoutUser = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProduction ? "None" : "Lax",
    secure: isProduction, 
  });

  res.status(200).json({ msg: "Logged out", success: true });
};

const checkAuth = (req, res) => {
  if (req.user) {
    return res.status(200).json({ isAuthenticated: true, user: req.user });
  } else {
    return res.status(401).json({ isAuthenticated: false });
  }
};

const sendemail = async(req,res)=>{
  const { name, email, subject, message } = req.body;

  try {
    await sendContactMail({ name, email, subject, message });
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' ,err: err.message });
  }
}

//google login

const googleLogin = async (req, res) => {
  try {
    const { profileObj } = req.body; // comes from frontend (Google response)
    const { googleId, email, name, imageUrl } = profileObj;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        profilePicture: imageUrl,
        password: "GOOGLE_AUTH_USER", // Placeholder
      });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Google login successful",
      token,
      user: { name: user.name, role: user.role },
      success: true
    });

  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google login failed", error: error.message });
  }
};

const jwt = require("jsonwebtoken");
const User = require("../models/User"); // adjust the path as needed

const setRole = async (req, res) => {
  const { role } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.role = role;
    await user.save();

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

   
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,       
        sameSite: "None", 
        maxAge:24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Role set successfully", user });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



module.exports = {
    registerUser,
    LoginUSer,
    getSingleUser,
    logoutUser,
    checkAuth,
    sendemail,
    googleLogin,
    setRole
}