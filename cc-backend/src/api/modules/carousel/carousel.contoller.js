
const Carousel = require("../carousel/carousel.model");
const { createImageLink } = require("../../utils/link-generator");
const slugify = require("slugify")
const container = require('@containers/awilix');
const storage = container.resolve('storage');

exports.getCarousel = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const search = req.query.search?.trim()

    const filter = {
      isActive: true,
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' }
    }

    const total = await Carousel.countDocuments(filter)

    let slides = await Carousel.find(filter)
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit)

    slides = slides.map((slide) => ({
      ...slide.toObject(),
      imageUrl: createImageLink(slide.imageUrl),
    }))

    return res.status(200).json({
      message: 'Carousels Fetched',
      result: slides,
      total,
      page,
      limit,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.getCarouselById = async (req, res) => {
    try {
      let { id } = req.params
      let result = await Carousel.findById(id)

      result.imageUrl = createImageLink(result.imageUrl)

      return res.status(200).json(result)

    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.createCarousel = async (req, res) => {
  try {
    const { title } = req.body;
    const titleSlug = slugify(title, { lower: true });
    req.body.slug = titleSlug

    const result = await storage.uploadFile(req.file, {
        subdir: "carousels",
        filename: `${titleSlug}-${Date.now()}`,
        resize: { width: 1000 }
    });

    req.body.imageUrl = result.path

    const newCarousel = await Carousel.create(req.body)
    return res.status(201).json({
      message: "Carousel Added",
      result: newCarousel
    })
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.updateCarousel = async (req, res) => {
  try {
      const cid = req.params.id
      const { title } = req.body;
      const carousel = await Carousel.findById(cid)
      if (!carousel) return res.status(404).json({ message: "Not found"})
      
      const titleSlug = slugify(title, { lower: true });
      req.body.slug = titleSlug

      if(req.file){
        await storage.deleteFile(carousel.imageUrl)
        const result = await storage.uploadFile(req.file, {
            subdir: "carousels",
            filename: `${titleSlug}-${Date.now()}`,
            resize: { width: 1000 }
        });
        req.body.imageUrl = result.path
      }
      
      
      const updated = await Carousel.findByIdAndUpdate(
        cid,
        req.body,
        { new: true }
      )
      
      return res.status(203).json({
        message: "Carousel Updated",
        result: updated
      })

  } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
  }

}


exports.deleteCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const carousel = await Carousel.findById(id);
    if (!carousel) return res.status(404).json({ message: "Carousel not found" });
    if (carousel.imageUrl) await storage.deleteFile(carousel.imageUrl);
    await carousel.deleteOne();
    return res.status(200).json({ message: "Carousel deleted successfully" });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};