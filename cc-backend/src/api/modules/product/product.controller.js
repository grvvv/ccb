// addProduct, deleteProduct, updateProduct, allProducts, productById

const Product = require("./product.model")
const slugify = require("slugify")
const container = require('@containers/awilix');
const Category = require("../category/category.model");
const { createImageLink } = require("../../utils/link-generator");
const storage = container.resolve('storage');

exports.addProduct = async (req, res) => {
  try {
    let {
      name,
      category,
      description,
      price,
      sellingPrice,
      sku,
      stock,
      weight,
      dimensions,
      b2bPricingTiers = [],
      isCODAvailable,
    } = req.body;

    const files = req.files || [];

    // normalize numeric fields
    price = Number(price);
    sellingPrice = Number(sellingPrice);
    stock = stock !== undefined ? Number(stock) : 10;
    weight = Number(weight);

    // normalize boolean
    if (typeof isCODAvailable === "string") {
      isCODAvailable = isCODAvailable === "true";
    }

    // required validations
    if (
      !name ||
      !category ||
      Number.isNaN(price) ||
      Number.isNaN(sellingPrice) ||
      !sku ||
      Number.isNaN(weight) ||
      !dimensions
    ) {
      return res.status(400).json({
        message: "Missing or invalid required fields",
      });
    }

    // validate pricing
    if (sellingPrice > price) {
      return res.status(400).json({
        message: "Selling price cannot be greater than MRP",
      });
    }

    // validate sku
    const existingSKU = await Product.findOne({ sku });

    if (existingSKU) {
      return res.status(400).json({
        message: "SKU already exists",
      });
    }

    // validate category
    const existingCategory = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!existingCategory) {
      return res.status(400).json({
        message: "Invalid or inactive category",
      });
    }

    // validate dimensions
    let parsedDimensions;

    try {
      parsedDimensions =
        typeof dimensions === "string" ? JSON.parse(dimensions) : dimensions;

      parsedDimensions.length = Number(parsedDimensions.length);
      parsedDimensions.width = Number(parsedDimensions.width);
      parsedDimensions.height = Number(parsedDimensions.height);

      const { length, width, height } = parsedDimensions;

      if (Number.isNaN(length) || Number.isNaN(width) || Number.isNaN(height)) {
        return res.status(400).json({
          message: "Invalid dimension values",
        });
      }
    } catch (error) {
      return res.status(400).json({
        message: "Invalid dimensions format",
      });
    }

    // generate slug
    const baseSlug = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // validate b2b pricing tiers
    let parsedTiers = [];

    try {
      parsedTiers =
        typeof b2bPricingTiers === "string"
          ? JSON.parse(b2bPricingTiers)
          : b2bPricingTiers;
    } catch (error) {
      return res.status(400).json({
        message: "Invalid B2B pricing tiers format",
      });
    }

    if (!Array.isArray(parsedTiers)) {
      return res.status(400).json({
        message: "B2B pricing tiers must be an array",
      });
    }

    parsedTiers = parsedTiers.map((tier) => ({
      minQty: Number(tier.minQty),
      maxQty:
        tier.maxQty !== null && tier.maxQty !== undefined && tier.maxQty !== ""
          ? Number(tier.maxQty)
          : null,
      price: Number(tier.price),
    }));

    if (parsedTiers.length > 0) {
      parsedTiers.sort((a, b) => a.minQty - b.minQty);

      for (let i = 0; i < parsedTiers.length; i++) {
        const tier = parsedTiers[i];

        if (Number.isNaN(tier.minQty) || Number.isNaN(tier.price)) {
          return res.status(400).json({
            message: "Invalid B2B tier data",
          });
        }

        if (tier.price > sellingPrice) {
          return res.status(400).json({
            message: "B2B price cannot exceed selling price",
          });
        }

        if (tier.maxQty !== null && Number.isNaN(tier.maxQty)) {
          return res.status(400).json({
            message: "Invalid maxQty value",
          });
        }

        if (tier.maxQty !== null && tier.maxQty < tier.minQty) {
          return res.status(400).json({
            message: "maxQty cannot be less than minQty",
          });
        }

        if (i > 0) {
          const prev = parsedTiers[i - 1];

          if (prev.maxQty === null || tier.minQty <= prev.maxQty) {
            return res.status(400).json({
              message: "B2B pricing tiers overlap",
            });
          }
        }
      }
    }

    // upload images
    const uploadedImages = await Promise.all(
      files.map((file) =>
        storage.uploadFile(file, {
          subdir: "products",
          filename: `${slug}-${Date.now()}`,
          resize: { width: 1000 },
        }),
      ),
    );

    const imagePaths = uploadedImages.map((r) => r.path);

    // create product
    const product = await Product.create({
      name,
      category,
      description,
      slug,
      price,
      sellingPrice,
      sku,
      stock,
      weight,
      dimensions: parsedDimensions,
      b2bPricingTiers: parsedTiers,
      isCODAvailable,
      productImages: imagePaths,
      thumbnail: imagePaths[0] || null,
    });

    return res.status(201).json({
      message: "Product Created",
      result: product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // delete images in parallel
        await Promise.all(
            product.productImages.map(img => storage.deleteFile(img))
        );

        return res.status(200).json({ message: 'Product Deleted' });

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const pid = req.params.id;
        const product = await Product.findById(pid);

        if (!product) return res.status(404).json({ message: "Product not found" });

        const files = req.files || [];
        const updateData = { ...req.body };

        if (updateData.price !== undefined) updateData.price = Number(updateData.price);
        if (updateData.sellingPrice !== undefined) updateData.sellingPrice = Number(updateData.sellingPrice)
        if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
        if (updateData.weight !== undefined) updateData.weight = Number(updateData.weight);
        if (
            updateData.price !== undefined ||
            updateData.sellingPrice !== undefined
        ) {
            const price = updateData.price ?? product.price;
            const sellingPrice = updateData.sellingPrice ?? product.sellingPrice;
            if (sellingPrice > price) return res.status(400).json({ message: "Selling price cannot be greater than MRP" });
        }

        // validate sku
        if (updateData.sku && updateData.sku !== product.sku) {
            const existingSKU = await Product.findOne({
                sku: updateData.sku,
            });

            if (existingSKU) {
                return res.status(400).json({
                    message: "SKU already exists",
                });
            }
        }

        // validate category
        if (updateData.category) {
            const existingCategory = await Category.findOne({
                _id: updateData.category,
                isActive: true,
            });

            if (!existingCategory) {
                return res.status(400).json({
                    message: "Invalid or inactive category",
                });
            }
        }

        // validate dimensions
        if (updateData.dimensions) {
            try {
                const parsedDimensions =
                    typeof updateData.dimensions === "string"
                        ? JSON.parse(updateData.dimensions)
                        : updateData.dimensions;

                parsedDimensions.length = Number(parsedDimensions.length);
                parsedDimensions.width = Number(parsedDimensions.width);
                parsedDimensions.height = Number(parsedDimensions.height);

                const { length, width, height } = parsedDimensions;

                if (
                    Number.isNaN(length) ||
                    Number.isNaN(width) ||
                    Number.isNaN(height)
                ) {
                    return res.status(400).json({
                        message: "Invalid dimension values",
                    });
                }

                updateData.dimensions = parsedDimensions;
            } catch (error) {
                return res.status(400).json({
                    message: "Invalid dimensions format",
                });
            }
        }

        // validate b2b pricing tiers
        if (updateData.b2bPricingTiers) {
            let parsedTiers = [];

            try {
                parsedTiers =
                    typeof updateData.b2bPricingTiers === "string"
                        ? JSON.parse(updateData.b2bPricingTiers)
                        : updateData.b2bPricingTiers;
            } catch (error) {
                return res.status(400).json({
                    message: "Invalid B2B pricing tiers format",
                });
            }

            if (!Array.isArray(parsedTiers)) {
                return res.status(400).json({
                    message: "B2B pricing tiers must be an array",
                });
            }

            const currentSellingPrice =
                updateData.sellingPrice ?? product.sellingPrice;

            parsedTiers = parsedTiers.map((tier) => ({
                minQty: Number(tier.minQty),
                maxQty:
                    tier.maxQty !== null &&
                        tier.maxQty !== undefined &&
                        tier.maxQty !== ""
                        ? Number(tier.maxQty)
                        : null,
                price: Number(tier.price),
            }));

            parsedTiers.sort((a, b) => a.minQty - b.minQty);

            for (let i = 0; i < parsedTiers.length; i++) {
                const tier = parsedTiers[i];

                if (Number.isNaN(tier.minQty) || Number.isNaN(tier.price)) {
                    return res.status(400).json({
                        message: "Invalid B2B tier data",
                    });
                }

                if (tier.price > currentSellingPrice) {
                    return res.status(400).json({
                        message: "B2B price cannot exceed selling price",
                    });
                }

                if (tier.maxQty !== null && Number.isNaN(tier.maxQty)) {
                    return res.status(400).json({
                        message: "Invalid maxQty value",
                    });
                }

                if (tier.maxQty !== null && tier.maxQty < tier.minQty) {
                    return res.status(400).json({
                        message: "maxQty cannot be less than minQty",
                    });
                }

                if (i > 0) {
                    const prev = parsedTiers[i - 1];

                    if (prev.maxQty === null || tier.minQty <= prev.maxQty) {
                        return res.status(400).json({
                            message: "B2B pricing tiers overlap",
                        });
                    }
                }
            }

            updateData.b2bPricingTiers = parsedTiers;
        }

        // upload new images
        let productImages = product.productImages;

        if (files.length > 0) {
            const uploaded = await Promise.all(
                files.map((file) =>
                    storage.uploadFile(file, {
                        subdir: "products",
                        filename: `product-${Date.now()}`,
                        resize: { width: 1000 },
                    }),
                ),
            );

            const newImages = uploaded.map((r) => r.path);

            await Promise.all(
                product.productImages.map((img) => storage.deleteFile(img)),
            );

            productImages = newImages;
        }

        updateData.productImages = productImages;
        updateData.thumbnail = productImages[0] || null;

        const updatedProduct = await Product.findByIdAndUpdate(pid, updateData, {
            new: true,
            runValidators: true,
        });

        const formatted = {
            ...updatedProduct.toObject(),
            category: updatedProduct.category?.name,
            productImages: updatedProduct.productImages.map(img => createImageLink(img)),
            thumbnail: createImageLink(updatedProduct.thumbnail)
        };

        return res.status(200).json(formatted);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

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
        const pid = req.params.id;

        const product = await Product.findById(pid).populate("category", "name");

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const formatted = {
            ...product.toObject(),
            category: product.category?.name,
            productImages: product.productImages.map(img => createImageLink(img)),
            thumbnail: createImageLink(product.thumbnail)
        };

        return res.status(200).json(formatted);

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};