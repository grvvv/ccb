// addProduct, deleteProduct, updateProduct, allProducts, productById

const Product = require("./product.model")
const slugify = require("slugify")
const container = require('@containers/awilix');
const Category = require("../category/category.model");
const { createImageLink } = require("../../utils/link-generator");
const { parse } = require("dotenv");
const storage = container.resolve('storage');

exports.addProduct = async (req, res) => {
    try {
        let {
            name,
            category,
            description,
            price,
            sellingPrice,
            stock,
            weight,
            dimensions,
            variantOptions = [],
            variants = [],
            isCODAvailable,
        } = req.body;

        const files = req.files || [];

        price = Number(price);
        sellingPrice = Number(sellingPrice);
        stock = Number(stock ?? 0);
        weight = Number(weight);

        if (typeof isCODAvailable === "string") {
            isCODAvailable = isCODAvailable === "true";
        }

        if (
            !name ||
            !category ||
            Number.isNaN(price) ||
            Number.isNaN(sellingPrice) ||
            Number.isNaN(weight) ||
            !dimensions
        ) {
            return res.status(400).json({
                message: "Missing or invalid required fields",
            });
        }

        if (sellingPrice > price) {
            return res.status(400).json({
                message: "Selling price cannot be greater than MRP",
            });
        }

        const existingCategory = await Category.findOne({
            _id: category,
            isActive: true,
        });

        if (!existingCategory) {
            return res.status(400).json({
                message: "Invalid or inactive category",
            });
        }

        let parsedDimensions;

        try {
            parsedDimensions =
                typeof dimensions === "string"
                    ? JSON.parse(dimensions)
                    : dimensions;

            parsedDimensions.length = Number(parsedDimensions.length);
            parsedDimensions.width = Number(parsedDimensions.width);
            parsedDimensions.height = Number(parsedDimensions.height);

            if (
                Number.isNaN(parsedDimensions.length) ||
                Number.isNaN(parsedDimensions.width) ||
                Number.isNaN(parsedDimensions.height)
            ) {
                return res.status(400).json({
                    message: "Invalid dimension values",
                });
            }
        } catch {
            return res.status(400).json({
                message: "Invalid dimensions format",
            });
        }

        let parsedVariantOptions = [];

        try {
            parsedVariantOptions =
                typeof variantOptions === "string"
                    ? JSON.parse(variantOptions)
                    : variantOptions;
        } catch {
            return res.status(400).json({
                message: "Invalid variant options format",
            });
        }

        if (!Array.isArray(parsedVariantOptions)) {
            return res.status(400).json({
                message: "Variant options must be an array",
            });
        }

        let parsedVariants = [];

        try {
            parsedVariants =
                typeof variants === "string"
                    ? JSON.parse(variants)
                    : variants;
        } catch {
            return res.status(400).json({
                message: "Invalid variants format",
            });
        }

        if (!Array.isArray(parsedVariants)) {
            return res.status(400).json({
                message: "Variants must be an array",
            });
        }

        parsedVariants = parsedVariants.map((variant) => ({
            sku: variant.sku?.trim().toUpperCase(),

            attributes:
                variant.attributes &&
                    typeof variant.attributes === "object"
                    ? Object.fromEntries(
                        Object.entries(variant.attributes).map(([key, value]) => [
                            key.toLowerCase().trim(),
                            String(value).trim(),
                        ])
                    )
                    : {},

            stock: Number(variant.stock),

            price:
                variant.price !== undefined
                    ? Number(variant.price)
                    : undefined,

            sellingPrice:
                variant.sellingPrice !== undefined
                    ? Number(variant.sellingPrice)
                    : undefined,

            weight:
                variant.weight !== undefined
                    ? Number(variant.weight)
                    : undefined,

            dimensions: variant.dimensions
                ? {
                    length: Number(variant.dimensions.length),
                    width: Number(variant.dimensions.width),
                    height: Number(variant.dimensions.height),
                }
                : undefined,
        }));

        const variantSKUSet = new Set();

        for (const variant of parsedVariants) {
            if (!variant.sku) {
                return res.status(400).json({
                    message: "Variant SKU is required",
                });
            }

            if (variantSKUSet.has(variant.sku)) {
                return res.status(400).json({
                    message: `Duplicate variant SKU: ${variant.sku}`,
                });
            }

            variantSKUSet.add(variant.sku);

            if (
                Number.isNaN(variant.stock) ||
                variant.stock < 0
            ) {
                return res.status(400).json({
                    message: `Invalid stock for SKU: ${variant.sku}`,
                });
            }

            const variantPrice = variant.price ?? price;
            const variantSellingPrice =
                variant.sellingPrice ?? sellingPrice;

            if (variantSellingPrice > variantPrice) {
                return res.status(400).json({
                    message: `Selling price cannot exceed MRP for SKU: ${variant.sku}`,
                });
            }

            if (
                variant.weight !== undefined &&
                (Number.isNaN(variant.weight) || variant.weight < 0)
            ) {
                return res.status(400).json({
                    message: `Invalid weight for SKU: ${variant.sku}`,
                });
            }

            if (variant.dimensions) {
                const { length, width, height } = variant.dimensions;

                if (
                    Number.isNaN(length) ||
                    Number.isNaN(width) ||
                    Number.isNaN(height)
                ) {
                    return res.status(400).json({
                        message: `Invalid dimensions for SKU: ${variant.sku}`,
                    });
                }
            }
        }

        const variantSkus = parsedVariants.map((v) => v.sku);

        if (variantSkus.length > 0) {
            const existingSKU = await Product.findOne({
                "variants.sku": { $in: variantSkus },
            });

            if (existingSKU) {
                return res.status(400).json({
                    message: "One or more variant SKUs already exist",
                });
            }

            stock = 0;
        } else {
            if (Number.isNaN(stock) || stock < 0) {
                return res.status(400).json({
                    message: "Invalid stock value",
                });
            }
        }

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

        const uploadedImages = await Promise.all(
            files.map((file) =>
                storage.uploadFile(file, {
                    subdir: "products",
                    filename: `${slug}-${Date.now()}`,
                    resize: { width: 1000 },
                })
            )
        );

        const imagePaths = uploadedImages.map((r) => r.path);

        const product = await Product.create({
            name,
            category,
            description,
            slug,

            stock,

            price,
            sellingPrice,

            weight,
            dimensions: parsedDimensions,

            variantOptions: parsedVariantOptions,
            variants: parsedVariants,

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

        if (updateData.variantOptions) {
            try {
                const parsedVariantOptions =
                    typeof updateData.variantOptions === "string"
                        ? JSON.parse(updateData.variantOptions)
                        : updateData.variantOptions;

                if (!Array.isArray(parsedVariantOptions)) {
                    return res.status(400).json({
                        message: "Variant options must be an array",
                    });
                }

                updateData.variantOptions = parsedVariantOptions;
            } catch {
                return res.status(400).json({
                    message: "Invalid variant options format",
                });
            }
        }

        if (updateData.variantOptions) {
            try {
                const parsedVariantOptions =
                    typeof updateData.variantOptions === "string"
                        ? JSON.parse(updateData.variantOptions)
                        : updateData.variantOptions;

                if (!Array.isArray(parsedVariantOptions)) {
                    return res.status(400).json({
                        message: "Variant options must be an array",
                    });
                }

                updateData.variantOptions = parsedVariantOptions;
            } catch {
                return res.status(400).json({
                    message: "Invalid variant options format",
                });
            }
        }

        if (updateData.variants) {
            let parsedVariants;

            try {
                parsedVariants =
                    typeof updateData.variants === "string"
                        ? JSON.parse(updateData.variants)
                        : updateData.variants;
            } catch {
                return res.status(400).json({
                    message: "Invalid variants format",
                });
            }

            if (!Array.isArray(parsedVariants)) {
                return res.status(400).json({
                    message: "Variants must be an array",
                });
            }

            parsedVariants = parsedVariants.map((variant) => ({
                sku: variant.sku?.trim().toUpperCase(),

                attributes:
                    variant.attributes &&
                        typeof variant.attributes === "object"
                        ? Object.fromEntries(
                            Object.entries(variant.attributes).map(([key, value]) => [
                                key.toLowerCase().trim(),
                                String(value).trim(),
                            ])
                        )
                        : {},

                stock: Number(variant.stock),

                price:
                    variant.price !== undefined
                        ? Number(variant.price)
                        : undefined,

                sellingPrice:
                    variant.sellingPrice !== undefined
                        ? Number(variant.sellingPrice)
                        : undefined,

                weight:
                    variant.weight !== undefined
                        ? Number(variant.weight)
                        : undefined,

                dimensions: variant.dimensions
                    ? {
                        length: Number(variant.dimensions.length),
                        width: Number(variant.dimensions.width),
                        height: Number(variant.dimensions.height),
                    }
                    : undefined,
            }));

            const skuSet = new Set();

            const basePrice =
                updateData.price ?? product.price;

            const baseSellingPrice =
                updateData.sellingPrice ?? product.sellingPrice;

            for (const variant of parsedVariants) {
                if (!variant.sku) {
                    return res.status(400).json({
                        message: "Variant SKU is required",
                    });
                }

                if (skuSet.has(variant.sku)) {
                    return res.status(400).json({
                        message: `Duplicate variant SKU: ${variant.sku}`,
                    });
                }

                skuSet.add(variant.sku);

                if (
                    Number.isNaN(variant.stock) ||
                    variant.stock < 0
                ) {
                    return res.status(400).json({
                        message: `Invalid stock for SKU: ${variant.sku}`,
                    });
                }

                const variantPrice =
                    variant.price ?? basePrice;

                const variantSellingPrice =
                    variant.sellingPrice ?? baseSellingPrice;

                if (variantSellingPrice > variantPrice) {
                    return res.status(400).json({
                        message: `Selling price cannot exceed MRP for SKU: ${variant.sku}`,
                    });
                }
            }

            const variantSkus =
                parsedVariants.map((v) => v.sku);

            if (variantSkus.length) {
                const existing = await Product.findOne({
                    _id: { $ne: pid },
                    "variants.sku": { $in: variantSkus },
                });

                if (existing) {
                    return res.status(400).json({
                        message: "One or more variant SKUs already exist",
                    });
                }
            }

            updateData.variants = parsedVariants;

            if (parsedVariants.length > 0) {
                updateData.stock = 0;
            }
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
        }).populate("category", "name");

        const formatted = {
            ...updatedProduct.toObject({
                flattenMaps: true,
            }),
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
            ...p.toObject({
                flattenMaps: true,
            }),
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
            ...product.toObject({
                flattenMaps: true,
            }),
            category: product.category?.name,
            productImages: product.productImages.map(img => createImageLink(img)),
            thumbnail: createImageLink(product.thumbnail),
            hasVariants: product.variants.length > 0
        };

        return res.status(200).json(formatted);

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};