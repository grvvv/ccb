const express = require('express');
const { signUp, getUsers, userProfile, addAddress, deleteAddress } = require('./user.controller');
const authorize = require('../../middlewares/role.middleware');
const { access } = require('../../middlewares/auth.middleware');
const router = express.Router();

router.use(access)
router.get('/me', userProfile)
router.get('/', authorize(["admin"]), getUsers);
router.delete("/remove-address/:addressId", deleteAddress)
router.patch("/add-address", addAddress)


module.exports = router;