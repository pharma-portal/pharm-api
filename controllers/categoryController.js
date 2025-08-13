import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = type ? { type } : {};

  const categories = await Category.find(query)
    .populate('parent', 'name')
    .sort('name');

  res.json(categories);
});

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = type ? { type } : {};

  const categories = await Category.find(query)
    .populate('parent', 'name')
    .sort('name');

  const buildTree = (items, parentId = null) => {
    return items
      .filter(item => item.parent?._id?.toString() === parentId?.toString())
      .map(item => ({
        ...item.toObject(),
        children: buildTree(items, item._id)
      }));
  };

  const tree = buildTree(categories);
  res.json(tree);
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parent', 'name');

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, type, parent } = req.body;

  const categoryExists = await Category.findOne({ name, type });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  let imageUrl = '';
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'categories');
    imageUrl = result.secure_url;
  }

  const category = await Category.create({
    name,
    description,
    type,
    parent: parent || null,
    image: imageUrl
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error('Invalid category data');
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, type, parent } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const categoryExists = await Category.findOne({
    name,
    type,
    _id: { $ne: req.params.id }
  });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  // Handle image upload
  let imageUrl = category.image;
  if (req.file) {
    if (category.image) {
      await deleteFromCloudinary(category.image);
    }
    const result = await uploadToCloudinary(req.file.path, 'categories');
    imageUrl = result.secure_url;
  }

  category.name = name;
  category.description = description;
  category.type = type;
  category.parent = parent || null;
  category.image = imageUrl;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Delete category image from cloudinary
  if (category.image) {
    await deleteFromCloudinary(category.image);
  }

  await category.deleteOne();
  res.json({ message: 'Category removed' });
});

// @desc    Get categories for frontend dropdowns
// @route   GET /api/categories/dropdown
// @access  Public
const getCategoriesForDropdown = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = type ? { type } : {};

  const categories = await Category.find(query)
    .populate('parent', 'name')
    .sort({ displayOrder: 1, name: 1 });

  // Structure for frontend dropdowns
  const dropdownData = categories
    .filter(cat => !cat.parent) // Only main categories
    .map(mainCat => ({
      value: mainCat._id,
      label: mainCat.name,
      description: mainCat.description,
      type: mainCat.type,
      subcategories: categories
        .filter(subCat => subCat.parent && subCat.parent._id.toString() === mainCat._id.toString())
        .map(subCat => ({
          value: subCat._id,
          label: subCat.name,
          description: subCat.description
        }))
    }));

  res.json(dropdownData);
});

// @desc    Get flat list of categories for simple dropdowns
// @route   GET /api/categories/flat
// @access  Public
const getFlatCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = type ? { type } : {};

  const categories = await Category.find(query)
    .populate('parent', 'name')
    .sort({ displayOrder: 1, name: 1 });

  // Flat structure for simple dropdowns
  const flatData = categories.map(cat => ({
    value: cat._id,
    label: cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name,
    description: cat.description,
    type: cat.type,
    isSubcategory: !!cat.parent,
    parentName: cat.parent?.name || null
  }));

  res.json(flatData);
});

// @desc    Get categories by type for frontend
// @route   GET /api/categories/type/:type
// @access  Public
const getCategoriesByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  
  if (!['drug', 'mart'].includes(type)) {
    res.status(400);
    throw new Error('Invalid category type. Must be "drug" or "mart"');
  }

  const categories = await Category.find({ type })
    .populate('parent', 'name')
    .sort({ displayOrder: 1, name: 1 });

  // Group by main categories and subcategories
  const mainCategories = categories.filter(cat => !cat.parent);
  const subcategories = categories.filter(cat => cat.parent);

  const structuredData = mainCategories.map(mainCat => ({
    ...mainCat.toObject(),
    subcategories: subcategories
      .filter(subCat => subCat.parent._id.toString() === mainCat._id.toString())
      .map(subCat => ({
        _id: subCat._id,
        name: subCat.name,
        description: subCat.description,
        displayOrder: subCat.displayOrder
      }))
  }));

  res.json(structuredData);
});

export {
  getCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesForDropdown,
  getFlatCategories,
  getCategoriesByType
}; 