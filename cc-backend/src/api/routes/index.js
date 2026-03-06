const express = require("express");
const router = express.Router();

// Import Routes
const authRoutes = require('../modules/auth/auth.route')
const userRoutes = require('../modules/user/user.route')
const productRoutes = require('../modules/product/product.route')
const categoryRoutes = require('../modules/category/category.route')
const cartRoutes = require('../modules/cart/cart.route');
const orderRoutes = require('../modules/orders/order.route')
const carouselRoutes = require('../modules/carousel/carousel.route')

const { storageBarrier } = require("../middlewares/auth.middleware");
const container = require('@containers/awilix');
const storage = container.resolve('storage');
const path = require('path');

// Tester-Side Routes
router.use("/auth", authRoutes)
router.use("/user", userRoutes)
router.use("/product", productRoutes)
router.use("/category", categoryRoutes)
router.use("/cart", cartRoutes)
router.use("/order", orderRoutes)
router.use("/carousel", carouselRoutes)


// General Routes
router.get("/get-image", async (req, res) => {
  const file = req.query.path;
  try {
    const stream = await storage.getFileStream(file);
    
    // Optional: Set proper content type based on file extension
    const ext = path.extname(file).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    stream.pipe(res);
  } catch (err) { 
    return res.status(404).json({ error: 'Image not found' });
  }
})

// Client-Side Routes

module.exports = router