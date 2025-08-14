import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @desc    Get all products with filters and pagination
// @route   GET /api/mart/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  // Check if pagination is requested
  const usePagination = req.query.page || req.query.pageSize;
  
  let pageSize = 10;
  let page = 1;
  
  if (usePagination) {
    pageSize = Number(req.query.pageSize) || 10;
    page = Number(req.query.page) || 1;
  }
  
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};
  const brand = req.query.brand ? { brand: req.query.brand } : {};
  
  // Price filters
  const minPrice = req.query.minPrice ? { price: { $gte: Number(req.query.minPrice) } } : {};
  const maxPrice = req.query.maxPrice ? { price: { $lte: Number(req.query.maxPrice) } } : {};
  
  // Featured filter
  const featured = req.query.featured === 'true' ? { featured: true } : {};
  
  // Combine all filters
  const filterQuery = {
    ...keyword,
    ...category,
    ...brand,
    ...minPrice,
    ...maxPrice,
    ...featured
  };

  const count = await Product.countDocuments(filterQuery);
  
  let products;
  if (usePagination) {
    // Use pagination
    products = await Product.find(filterQuery)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });
  } else {
    // Return all products
    products = await Product.find(filterQuery)
      .sort({ createdAt: -1 });
  }

  if (usePagination) {
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } else {
    res.json({
      products,
      total: count
    });
  }
});

// @desc    Get all products (no pagination)
// @route   GET /api/mart/products/all
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .sort({ createdAt: -1 });

  res.json({
    products,
    total: products.length
  });
});

// @desc    Get a single product by ID
// @route   GET /api/mart/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/mart/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    brand,
    category,
    price,
    countInStock,
    image,
    featured,
    discountPercentage,
    weight,
    dimensions,
    barcode,
    suitableFor,
    caution,
    howToUse,
    specifications
  } = req.body;

  const product = new Product({
    name,
    description,
    brand,
    category,
    price,
    countInStock,
    image: req.file ? req.file.path : (image || 'default-product.jpg'),
    featured: featured || false,
    discountPercentage: discountPercentage || 0,
    weight,
    dimensions,
    barcode,
    suitableFor,
    caution,
    howToUse,
    specifications,
    rating: 0,
    numReviews: 0
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/mart/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    brand,
    category,
    price,
    countInStock,
    image,
    featured,
    discountPercentage,
    weight,
    dimensions,
    barcode,
    suitableFor,
    caution,
    howToUse,
    specifications
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.price = price || product.price;
    product.countInStock = countInStock || product.countInStock;
    
    if (req.file) {
      product.image = req.file.path;
    } else if (image) {
      product.image = image;
    }
    
    product.featured = featured !== undefined ? featured : product.featured;
    product.discountPercentage = discountPercentage !== undefined ? discountPercentage : product.discountPercentage;
    product.weight = weight || product.weight;
    product.dimensions = dimensions || product.dimensions;
    product.barcode = barcode || product.barcode;
    product.suitableFor = suitableFor || product.suitableFor;
    product.caution = caution || product.caution;
    product.howToUse = howToUse || product.howToUse;
    product.specifications = specifications || product.specifications;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/mart/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a new review
// @route   POST /api/mart/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/mart/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 5;
  
  const products = await Product.find({})
    .sort({ rating: -1 })
    .limit(limit);

  res.json(products);
});

// @desc    Get all available product categories
// @route   GET /api/mart/products/categories
// @access  Public
const getProductCategories = asyncHandler(async (req, res) => {
  const categories = Product.getCategories();
  const mainCategories = Product.getMainCategories();
  
  // Structure for frontend dropdowns
  const dropdownData = mainCategories.map(mainCat => ({
    value: mainCat,
    label: mainCat,
    subcategories: Product.getSubcategories(mainCat).map(subCat => ({
      value: subCat,
      label: subCat
    }))
  }));

  res.json({
    allCategories: categories,
    mainCategories: mainCategories,
    dropdownData: dropdownData
  });
});

// @desc    Get subcategories for a specific main category
// @route   GET /api/mart/products/categories/:mainCategory/subcategories
// @access  Public
const getProductSubcategories = asyncHandler(async (req, res) => {
  const { mainCategory } = req.params;
  const subcategories = Product.getSubcategories(mainCategory);
  
  if (subcategories.length === 0) {
    res.status(404);
    throw new Error('Main category not found or has no subcategories');
  }
  
  res.json({
    mainCategory,
    subcategories: subcategories.map(subCat => ({
      value: subCat,
      label: subCat
    }))
  });
});

export {
  getProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductCategories,
  getProductSubcategories
}; 