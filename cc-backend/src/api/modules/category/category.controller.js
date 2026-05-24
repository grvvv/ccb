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
    const { name, icon, parent, order } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    const updateData = {
      icon,
      parent: parent || null,
      order
    };

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true });
    }

    if (req.file) {
      if (category.image) {
        await storage.deleteFile(category.image);
      }

      const result = await storage.uploadFile(req.file, {
        subdir: "category",
        filename: `${updateData.slug || category.slug}-${Date.now()}`,
        resize: { width: 1000 }
      });

      updateData.image = result.path;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      message: "Category Updated",
      result: updatedCategory
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal Server Error"
    });
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

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    // optional: delete image from storage
    if (category.image) {
      await storage.deleteFile(category.image);
    }

    await category.deleteOne();

    return res.status(200).json({
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};