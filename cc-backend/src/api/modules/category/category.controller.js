const Category = require("./category.model")
const slugify = require("slugify")
const container = require('@containers/awilix');
const { createImageLink } = require("../../utils/link-generator");
const storage = container.resolve('storage');

exports.getCategoryById = async (req, res) => {
    try {
        let cid = req.params.id;
        let category = await Category.findById(cid)
        
        if (category){
            category.image = createImageLink(category.image)
        }
        return res.status(200).json(category)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: 'Internal Server Error' });
    }

};

exports.createCategory = async (req, res) => {
    try {
        const { name, icon, parent, order } = req.body;
        let categorySlug = slugify(name, { lower: true })
        let image = req.file

        const result = await storage.uploadFile(image, {
            subdir: `category`,
            filename: `${categorySlug}-${Date.now()}`,
            resize: { width: 1000 }
        });

        const category = await Category.create({
            name,
            slug: categorySlug,
            icon,
            image: result.path,
            parent: parent || null,
            order
        });

        return res.status(201).json({
            message: "Category Created",
            result: category
        });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({error: "Internal Server Error"})
    }
  
};

exports.getFeaturedCategories = async (req, res) => {
    try {
        let categories = await Category.find({
            isActive: true,
            parent: null
        })
            .sort({ order: 1 })
            .select("name slug icon image order");

        categories = categories.map(cat => ({
            ...cat.toObject(),
            image: createImageLink(cat.image)
        }))
        res.json({
            message: "Categories Fetched",
            result: categories
        });
    } catch (error) {
        return res.status(500).json({error: "Internal Server Error"})
    }
  
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        return res.json(category);
    } catch (error) {
        return res.status(500).json({error: "Internal Server Error"})
    }
 
};

exports.toggleCategoryStatus = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        category.isActive = !category.isActive;
        await category.save();

        return res.json({ success: true, result: category });
    } catch (error) {
        return res.status(500).json({error: "Internal Server Error"})
    }
  
};
