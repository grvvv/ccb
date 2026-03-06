const express = require('express');
const { signUp, getUsers, userProfile } = require('./user.controller');
const authorize = require('../../middlewares/role.middleware');
const { access } = require('../../middlewares/auth.middleware');
const router = express.Router();

router.use(access)
router.get('/me', userProfile)
router.get('/', authorize(["admin"]), getUsers);


module.exports = router;