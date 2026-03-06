// addProduct, deleteProduct, updateProduct, allProducts, productById

const Product = require("./product.model")
const slugify = require("slugify")
const container = require('@containers/awilix');
const Category = require("../category/category.model");
const { createImageLink } = require("../../utils/link-generator");
const storage = container.resolve('storage');

exports.addProduct = async (req, res) => {
  try {
    const { name, category, description, price, sellingPrice } = req.body;
    const files = req.files;

    if (!name || !category || !price || !sellingPrice) {
      return res.status(400).json({
        message: "Please provide all essential fields."
      });
    }

    const existingCategory = await Category.findOne({
      _id: category,
      isActive: true
    });

    if (!existingCategory) {
      return res.status(400).json({
        message: "Invalid or inactive category."
      });
    }

    const productSlug = slugify(name, { lower: true });
    req.body.slug = productSlug;

    const productImages = [];
    for (const file of files) {
      const result = await storage.uploadFile(file, {
        subdir: "products",
        filename: `${productSlug}-${Date.now()}`,
        resize: { width: 1000 }
      });

      productImages.push(result.path);
    }

    req.body.productImages = productImages;
    req.body.thumbnail = productImages[0]

    const product = await Product.create(req.body);

    return res.status(201).json({
      message: "Product Created",
      result: product
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        for (const image of product.productImages){
            await storage.deleteFile(image)
        }
        
        return res.status(200).json({ message: 'Product Deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        let pid = req.params.id
        const product = await Product.findById(pid);
        const files = req.files; 

        const productImages = [];
        for (const file of files) {
            const result = await storage.uploadFile(file, {
                subdir: `products`,
                filename: `product-${Date.now()}`,
                resize: { width: 1000 }
            });

            productImages.push(result.path);
        }

        for (const image of product.productImages){
            await storage.deleteFile(image)
        }

        req.body.productImages = productImages;

        let updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {new: true});
        return res.status(200).json({ message: 'Product Updated', result: updatedProduct});
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

exports.allProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const categoryName = req.query.category
    const search = req.query.search

    const skip = (page - 1) * limit
    let filter = {}

    if (categoryName) {
      const category = await Category.findOne({ slug: categoryName })
      if (!category) return res.status(404).json({ message: "Category not found" })
      filter.category = category._id
    }

    // search filter
    if (search) { filter.name = { $regex: search, $options: "i" } }

    const products = await Product.find(filter)
      .populate("category", "name")
      .skip(skip)
      .limit(limit)

    const total = await Product.countDocuments(filter)

    const formatted = products.map((p) => ({
      ...p.toObject(),
      thumbnail: createImageLink(p.thumbnail),
      category: p.category?.name
    }))

    return res.status(200).json({
      message: "Products Fetched",
      result: formatted,
      total,
      page,
      pages: Math.ceil(total / limit)
    })

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error"
    })
  }
}
exports.productById = async (req, res) => {
    try {
        let pid = req.params.id;
        let product = await Product.findById(pid)
        let category = await Category.findById(product.category)
        product.category = category.name
        if (product){
            product.productImages = product.productImages.map((img) => {
                return createImageLink(img)
            })
        }
        return res.status(200).json(product)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}