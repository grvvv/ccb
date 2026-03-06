const mongoose = require('mongoose')
exports.emailRegex = (req,res,next)=>{
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(emailRegex.test(req.body.email)){
      next()
  }else{
      return res.status(400).json({message:"Email does not matches regex pattern"});
  }
}

exports.passwordRegex = (req,res,next)=>{
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  if(passwordRegex.test(req.body.pass)){
      next()
  }else{
      return res.status(400).json({message:"At least 8 characters long & Contain at least 1 uppercase letter and special character"});
  }
}

exports.emptyChecker = (req,res,next)=>{
  for (const key in req.body){
    if(req.body[key] === "") return res.status(400).json({message:"Empty values are not allowed"})
  }
  next()
}

exports.bsonChecker = (req, res, next) => {
  for (const param in req.params){
    if(!mongoose.Types.ObjectId.isValid(req.params[param])) return res.status(400).json({message:"Invalid ID"});
  }
  next()
}