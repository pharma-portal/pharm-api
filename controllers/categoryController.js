import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';

// @desc    Get all categories
// @route   GET /api/mart/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  // Get top-level categories (no parent)
  const parentCategories = await Category.find({ parent: null, isActive: true })
    .sort({ displayOrder: 1, name: 1 });
  
  res.json(parentCategories);
});

// @desc    Get all categories with their subcategories
// @route   GET /api/mart/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
  // Get all categories
  const allCategories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
  
  // Create a map for efficient lookup
  const categoriesMap = {};
  allCategories.forEach(category => {
    categoriesMap[category._id] = {
      ...category.toObject(),
      children: []
    };
  });
  
  // Build the tree structure
  const rootCategories = [];
  allCategories.forEach(category => {
    if (category.parent) {
      // This is a child category
      if (categoriesMap[category.parent]) {
        categoriesMap[category.parent].children.push(categoriesMap[category._id]);
      }
    } else {
      // This is a root category
      rootCategories.push(categoriesMap[category._id]);
    }
  });
  
  res.json(rootCategories);
});

// @desc    Get a single category by ID with its products
// @route   GET /api/mart/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    // Find subcategories
    const subcategories = await Category.find({ parent: category._id, isActive: true });
    
    res.json({
      ...category.toObject(),
      subcategories
    });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create a category
// @route   POST /api/mart/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parent, displayOrder } = req.body;

  const category = new Category({
    name,
    description,
    image: image || 'default-category.jpg',
    parent: parent || null,
    displayOrder: displayOrder || 0,
    isActive: true
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

// @desc    Update a category
// @route   PUT /api/mart/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parent, displayOrder, isActive } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    // Check for circular reference
    if (parent && parent.toString() === req.params.id) {
      res.status(400);
      throw new Error('Category cannot be its own parent');
    }
    
    // Verify that the parent exists if specified
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        res.status(400);
        throw new Error('Parent category not found');
      }
    }
    
    category.name = name || category.name;
    category.description = description || category.description;
    category.image = image || category.image;
    category.parent = parent !== undefined ? parent : category.parent;
    category.displayOrder = displayOrder !== undefined ? displayOrder : category.displayOrder;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete a category
// @route   DELETE /api/mart/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    // Check if there are any subcategories
    const hasSubcategories = await Category.findOne({ parent: category._id });
    if (hasSubcategories) {
      res.status(400);
      throw new Error('Cannot delete category with subcategories. Delete or reassign subcategories first.');
    }
    
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

export {
  getCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
}; 