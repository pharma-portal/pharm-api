import asyncHandler from 'express-async-handler';
import Drug from '../models/drugModel.js';

// @desc    Get all drugs with filters
// @route   GET /api/drugs
// @access  Public
const getDrugs = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  // Build filter object
  const filter = {};

  // Search by keyword in name or description
  if (req.query.keyword) {
    filter.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } }
    ];
  }

  // Filter by category
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Filter by brand
  if (req.query.brand) {
    filter.brand = { $regex: `^${req.query.brand}$`, $options: 'i' };
  }

  // Filter by prescription requirement
  if (req.query.requiresPrescription !== undefined) {
    filter.requiresPrescription = req.query.requiresPrescription === 'true';
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  // Filter by stock availability
  if (req.query.inStock === 'true') {
    filter.inStock = { $gt: 0 };
  }

  // Filter by dosage form
  if (req.query.dosageForm) {
    filter.dosageForm = req.query.dosageForm;
  }

  // Build sort object
  let sortBy = {};
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price-asc':
        sortBy = { price: 1 };
        break;
      case 'price-desc':
        sortBy = { price: -1 };
        break;
      case 'name-asc':
        sortBy = { name: 1 };
        break;
      case 'name-desc':
        sortBy = { name: -1 };
        break;
      case 'newest':
        sortBy = { createdAt: -1 };
        break;
      case 'rating':
        sortBy = { rating: -1 };
        break;
      default:
        sortBy = { createdAt: -1 };
    }
  } else {
    sortBy = { createdAt: -1 };
  }

  const count = await Drug.countDocuments(filter);
  const drugs = await Drug.find(filter)
    .sort(sortBy)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  // Get unique categories and brands for filters
  const categories = await Drug.distinct('category');
  const brands = await Drug.distinct('brand');
  const dosageForms = await Drug.distinct('dosageForm');

  res.json({
    drugs,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
    filters: {
      categories,
      brands,
      dosageForms
    }
  });
});

// @desc    Get single drug
// @route   GET /api/drugs/:id
// @access  Public
const getDrugById = asyncHandler(async (req, res) => {
  const drug = await Drug.findById(req.params.id);
  if (drug) {
    res.json(drug);
  } else {
    res.status(404);
    throw new Error('Drug not found');
  }
});

// @desc    Create drug
// @route   POST /api/drugs
// @access  Private/Admin
const createDrug = asyncHandler(async (req, res) => {
  const drug = new Drug({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    brand: req.body.brand,
    category: req.body.category,
    requiresPrescription: req.body.requiresPrescription,
    inStock: req.body.inStock,
    dosageForm: req.body.dosageForm,
    strength: req.body.strength,
    image: req.file ? req.file.path : 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1/pharmacy/drugs/default-drug.jpg'
  });

  const createdDrug = await drug.save();
  res.status(201).json(createdDrug);
});

// @desc    Update drug
// @route   PUT /api/drugs/:id
// @access  Private/Admin
const updateDrug = asyncHandler(async (req, res) => {
  const drug = await Drug.findById(req.params.id);

  if (drug) {
    drug.name = req.body.name || drug.name;
    drug.description = req.body.description || drug.description;
    drug.price = req.body.price || drug.price;
    drug.brand = req.body.brand || drug.brand;
    drug.category = req.body.category || drug.category;
    drug.requiresPrescription = req.body.requiresPrescription ?? drug.requiresPrescription;
    drug.inStock = req.body.inStock ?? drug.inStock;
    drug.dosageForm = req.body.dosageForm || drug.dosageForm;
    drug.strength = req.body.strength || drug.strength;
    
    if (req.file) {
      drug.image = req.file.path;
    }

    const updatedDrug = await drug.save();
    res.json(updatedDrug);
  } else {
    res.status(404);
    throw new Error('Drug not found');
  }
});

// @desc    Delete drug
// @route   DELETE /api/drugs/:id
// @access  Private/Admin
const deleteDrug = asyncHandler(async (req, res) => {
  const drug = await Drug.findById(req.params.id);

  if (drug) {
    await drug.deleteOne();
    res.json({ message: 'Drug removed' });
  } else {
    res.status(404);
    throw new Error('Drug not found');
  }
});

// @desc    Create drug review
// @route   POST /api/drugs/:id/reviews
// @access  Private
const createDrugReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const drug = await Drug.findById(req.params.id);

  if (drug) {
    const alreadyReviewed = drug.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Drug already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id
    };

    drug.reviews.push(review);
    await drug.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Drug not found');
  }
});

// @desc    Get drugs by category
// @route   GET /api/drugs/category/:category
// @access  Public
const getDrugsByCategory = asyncHandler(async (req, res) => {
  const drugs = await Drug.find({ category: req.params.category });
  res.json(drugs);
});

// @desc    Get drugs by brand
// @route   GET /api/drugs/brand/:brand
// @access  Public
const getDrugsByBrand = asyncHandler(async (req, res) => {
  const drugs = await Drug.find({ 
    brand: { $regex: `^${req.params.brand}$`, $options: 'i' }
  });
  
  if (drugs.length === 0) {
    // If no exact match found, get list of available brands for suggestion
    const availableBrands = await Drug.distinct('brand');
    res.status(404).json({ 
      message: 'No drugs found for this brand',
      availableBrands: availableBrands
    });
    return;
  }
  
  res.json(drugs);
});

export {
  getDrugs,
  getDrugById,
  createDrug,
  updateDrug,
  deleteDrug,
  createDrugReview,
  getDrugsByCategory,
  getDrugsByBrand
}; 