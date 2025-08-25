import asyncHandler from 'express-async-handler';
import Cart from '../models/cartModel.js';
import Drug from '../models/drugModel.js';
import Product from '../models/productModel.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Public/Private
const getCart = asyncHandler(async (req, res) => {
  if (req.user) {
    // For logged-in users, get cart from database
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.drug', 'name price image requiresPrescription')
      .populate('items.product', 'name price image');
    
    if (cart) {
      res.json(cart);
    } else {
      res.json({ items: [], totalAmount: 0 });
    }
  } else {
    // For guest users, return empty cart (cart will be managed on client side)
    res.json({ items: [], totalAmount: 0 });
  }
});

// @desc    Add drug to cart (pharmacy)
// @route   POST /api/cart/drug
// @route   POST /api/cart/drug/prescription
// @access  Public/Private
const addDrugToCart = asyncHandler(async (req, res) => {
  const { drugId, quantity } = req.body;

  const drug = await Drug.findById(drugId);
  if (!drug) {
    res.status(404);
    throw new Error('Drug not found');
  }

  // Check if this is the prescription endpoint
  const isPrescriptionEndpoint = req.originalUrl.includes('/prescription');

  // Check if drug requires prescription
  if (drug.requiresPrescription) {
    // If prescription required, user must be logged in
    if (!req.user) {
      res.status(401);
      throw new Error('Please login to purchase prescription drugs');
    }
    
    // Must use prescription endpoint for prescription drugs
    if (!isPrescriptionEndpoint) {
      res.status(400);
      throw new Error('This drug requires a prescription. Please use the prescription endpoint: /api/cart/drug/prescription');
    }
    
    // Check for prescription file
    if (!req.file) {
      res.status(400);
      throw new Error('Prescription required for this drug');
    }
  } else {
    // For non-prescription drugs, must use regular endpoint
    if (isPrescriptionEndpoint) {
      res.status(400);
      throw new Error('This drug does not require a prescription. Please use the regular endpoint: /api/cart/drug');
    }
    
    // Ensure no prescription file is uploaded for non-prescription drugs
    if (req.file) {
      res.status(400);
      throw new Error('Prescription file not needed for non-prescription drugs');
    }
  }

  if (drug.inStock < quantity) {
    res.status(400);
    throw new Error('Not enough stock');
  }

  if (req.user) {
    // For logged-in users, save to database
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [{
          itemType: 'drug',
          drug: drugId,
          quantity,
          price: drug.price,
          prescriptionFile: req.file ? req.file.path : undefined,
          requiresPrescription: drug.requiresPrescription
        }]
      });
    } else {
      const existingItem = cart.items.find(
        item => item.itemType === 'drug' && item.drug && item.drug.toString() === drugId
      );

      if (existingItem) {
        existingItem.quantity = quantity;
        if (req.file) {
          existingItem.prescriptionFile = req.file.path;
        }
      } else {
        cart.items.push({
          itemType: 'drug',
          drug: drugId,
          quantity,
          price: drug.price,
          prescriptionFile: req.file ? req.file.path : undefined,
          requiresPrescription: drug.requiresPrescription
        });
      }
    }

    await cart.save();
    res.status(201).json(cart);
  } else {
    // For guest users, return the item details (cart will be managed on client side)
    res.status(201).json({
      itemType: 'drug',
      drug: {
        _id: drug._id,
        name: drug.name,
        price: drug.price,
        image: drug.image,
        requiresPrescription: drug.requiresPrescription
      },
      quantity,
      price: drug.price
    });
  }
});

// @desc    Add product to cart (mart)
// @route   POST /api/cart/product
// @access  Public/Private
const addProductToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if stock is available and sufficient
  if (!product.countInStock || product.countInStock < quantity) {
    res.status(400);
    throw new Error(`Not enough stock. Available: ${product.countInStock || 0}, Requested: ${quantity}`);
  }

  if (req.user) {
    // For logged-in users, save to database
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [{
          itemType: 'product',
          product: productId,
          quantity,
          price: product.price
        }]
      });
    } else {
      const existingItem = cart.items.find(
        item => item.itemType === 'product' && item.product && item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity = quantity;
      } else {
        cart.items.push({
          itemType: 'product',
          product: productId,
          quantity,
          price: product.price
        });
      }
    }

    await cart.save();
    res.status(201).json(cart);
  } else {
    // For guest users, return the item details (cart will be managed on client side)
    res.status(201).json({
      itemType: 'product',
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image
      },
      quantity,
      price: product.price
    });
  }
});

// @desc    Update cart item
// @route   PUT /api/cart/:id
// @access  Public/Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (req.user) {
    // For logged-in users, update in database
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const cartItem = cart.items.find(
      item => item._id.toString() === req.params.id
    );

    if (cartItem) {
      if (cartItem.itemType === 'drug') {
        const drug = await Drug.findById(cartItem.drug);
        if (!drug) {
          res.status(404);
          throw new Error('Drug not found');
        }
        
        if (drug.inStock < quantity) {
          res.status(400);
          throw new Error('Not enough stock');
        }
      } else if (cartItem.itemType === 'product') {
        const product = await Product.findById(cartItem.product);
        if (!product) {
          res.status(404);
          throw new Error('Product not found');
        }
        
        // Check if stock is available and sufficient
        if (!product.countInStock || product.countInStock < quantity) {
          res.status(400);
          throw new Error(`Not enough stock. Available: ${product.countInStock || 0}, Requested: ${quantity}`);
        }
      }

      cartItem.quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404);
      throw new Error('Item not found in cart');
    }
  } else {
    // For guest users, just acknowledge the update
    res.json({ message: 'Quantity updated', quantity });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Public/Private
const removeFromCart = asyncHandler(async (req, res) => {
  if (req.user) {
    // For logged-in users, remove from database
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.id
    );

    await cart.save();
    res.json(cart);
  } else {
    // For guest users, just return success
    res.json({ message: 'Item removed' });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Public/Private
const clearCart = asyncHandler(async (req, res) => {
  if (req.user) {
    // For logged-in users, clear database cart
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.json({ message: 'Cart cleared' });
  } else {
    // For guest users, just return success
    res.json({ message: 'Cart cleared' });
  }
});

export {
  getCart,
  addDrugToCart,
  addProductToCart,
  updateCartItem,
  removeFromCart,
  clearCart
}; 