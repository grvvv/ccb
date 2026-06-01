const express = require('express');
const router = express.Router();
const { verifyPayment } = require('./payment.controller');
const { access } = require('../../middlewares/auth.middleware');

// Both endpoints require an authenticated user
router.use(access);

router.post('/verify-payment', verifyPayment);

module.exports = router;