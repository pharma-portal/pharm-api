import asyncHandler from 'express-async-handler';
import Cart from '../models/cartModel.js';
import Drug from '../models/drugModel.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Public/Private
const getCart = asyncHandler(async (req, res) => {
  if (req.user) {
    // For logged-in users, get cart from database
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.drug', 'name price image requiresPrescription');
    
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

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Public/Private
const addToCart = asyncHandler(async (req, res) => {
  const { drugId, quantity } = req.body;

  const drug = await Drug.findById(drugId);
  if (!drug) {
    res.status(404);
    throw new Error('Drug not found');
  }

  // Check if drug requires prescription
  if (drug.requiresPrescription) {
    // If prescription required, user must be logged in
    if (!req.user) {
      res.status(401);
      throw new Error('Please login to purchase prescription drugs');
    }
    // Check for prescription file
    if (!req.file) {
      res.status(400);
      throw new Error('Prescription required for this drug');
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
          drug: drugId,
          quantity,
          price: drug.price,
          prescription: req.file ? req.file.path : undefined,
          requiresPrescription: drug.requiresPrescription
        }]
      });
    } else {
      const existingItem = cart.items.find(
        item => item.drug.toString() === drugId
      );

      if (existingItem) {
        existingItem.quantity = quantity;
        if (req.file) {
          existingItem.prescription = req.file.path;
        }
      } else {
        cart.items.push({
          drug: drugId,
          quantity,
          price: drug.price,
          prescription: req.file ? req.file.path : undefined,
          requiresPrescription: drug.requiresPrescription
        });
      }
    }

    await cart.save();
    res.status(201).json(cart);
  } else {
    // For guest users, return the item details (cart will be managed on client side)
    res.status(201).json({
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
      const drug = await Drug.findById(cartItem.drug);
      if (drug.inStock < quantity) {
        res.status(400);
        throw new Error('Not enough stock');
      }

      cartItem.quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404);
      throw new Error('Item not found in cart');
    }
  } else {
    // For guest users, just validate the quantity
    const drug = await Drug.findById(req.params.id);
    if (!drug) {
      res.status(404);
      throw new Error('Drug not found');
    }

    if (drug.inStock < quantity) {
      res.status(400);
      throw new Error('Not enough stock');
    }

    res.json({
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
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }
  }

  res.json({ message: 'Cart cleared' });
});

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
}; 