const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../user/user.model');
const config = require('@config');
const crypto = require("crypto");
const { getCleanNumber } = require('../../utils/validators.js');

const ACCESS_JWT_SECRET = config.jwt.access.secret;
const SALT_ROUNDS = config.bcrypt.saltRounds;

const MAILER_MAIL = config.mailer.email
const MAILER_PASSWORD = config.mailer.password
const IPv4 = config.ip
const PORT = config.port

exports.signUp = async (req, res) => {
  let { name, email, password, phone } = req.body;
  if(!name || !email || !password || !phone) return res.status(400).json({ message: 'Please fill required fields'})
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    if(getCleanNumber(phone)){
      phone = getCleanNumber(phone)
    } else {
      return res.status(400).json({ message: 'Please enter a vaild phone number' })
    }
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) return res.status(400).json({ message: 'Phone number already in use' });
    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "general"
    });
    const userObj = user.toObject()
    delete userObj.password

    res.status(201).json(user);
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};

// LOGIN: Generates authToken after credential check
exports.signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        if(!email || !password) return res.status(400).json({ message: "Insufficient Credentials"})
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).json({ message: "User not found" });
        
        const userObj = user.toObject()
        delete userObj.password

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const authToken = jwt.sign({ 
            email: user.email, 
            role: user.role,
            id: user._id
         }, ACCESS_JWT_SECRET, { expiresIn: config.jwt.access.expiry });
        res.status(200).json({ message: 'Login successful', authToken, user: userObj });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
  const { email, redirectUrl } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) return res.status(200).json({ message: "If the email exists, a reset link will be sent." }); //email enumeration 
 
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 300000; // 5min
 
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiry;
    await user.save();
 
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: MAILER_MAIL,
        pass: MAILER_PASSWORD
      }
    });
 
    const resetLink = `${redirectUrl}?token=${token}`;
 
    await transporter.sendMail({
      from: config.mailer.email,
      to: email,
      subject: "ART Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });
 
    res.status(200).json({ message: "Reset link sent to email." });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" });
  }
};
 
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now()},
    });
 
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
 
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
 
    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
