const express = require("express");
const router = express.Router();

const { createCarousel, updateCarousel, getCarousel, getCarouselById } = require("./carousel.contoller")
const { bsonChecker } = require("../../middlewares/policy.middleware");
const authorize = require('../../middlewares/role.middleware');
const { access } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/storage.middleware');

// Public
router.get("/", getCarousel)

router.use(access)

// Create Order
router.use(authorize(['admin']))
router.get("/:id", getCarouselById)
router.post("/add", upload.single("image"), createCarousel)

// Update image
router.put("/update/:id", bsonChecker, upload.single("image"), updateCarousel)

module.exports = router;
