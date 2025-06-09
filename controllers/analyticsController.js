import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Drug from '../models/drugModel.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';

// @desc    Get overall sales analytics
// @route   GET /api/analytics/sales
// @access  Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = { isPaid: true };

  // Add date range if provided
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Get all paid orders
  const orders = await Order.find(query);

  // Calculate total sales
  const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  // Calculate total orders
  const totalOrders = orders.length;

  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Get sales trends (daily for the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailySales = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        sales: { $sum: "$totalPrice" },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get sales by category
  const categorySales = await Order.aggregate([
    {
      $match: { isPaid: true }
    },
    {
      $unwind: "$orderItems"
    },
    {
      $lookup: {
        from: "drugs",
        localField: "orderItems.item",
        foreignField: "_id",
        as: "drug"
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.item",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $gt: [{ $size: "$drug" }, 0] },
            "drug",
            "mart"
          ]
        },
        totalSales: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  // Get top selling products
  const topProducts = await Order.aggregate([
    {
      $match: { isPaid: true }
    },
    {
      $unwind: "$orderItems"
    },
    {
      $group: {
        _id: "$orderItems.item",
        totalSold: { $sum: "$orderItems.qty" },
        totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Get product details for top products
  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (product) => {
      let productDetails;
      if (await Drug.findById(product._id)) {
        productDetails = await Drug.findById(product._id).select('name price image');
        productDetails = { ...productDetails.toObject(), type: 'drug' };
      } else {
        productDetails = await Product.findById(product._id).select('name price images');
        productDetails = { ...productDetails.toObject(), type: 'mart' };
      }
      return {
        ...product,
        ...productDetails
      };
    })
  );

  res.json({
    totalSales,
    totalOrders,
    averageOrderValue,
    salesTrends: dailySales,
    categorySales,
    topProducts: topProductsWithDetails,
    dateRange: {
      startDate: startDate || 'all time',
      endDate: endDate || 'all time'
    }
  });
});

// @desc    Get category-wise analytics
// @route   GET /api/analytics/categories
// @access  Private/Admin
const getCategoryAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = { isPaid: true };

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const categoryAnalytics = await Order.aggregate([
    {
      $match: query
    },
    {
      $unwind: "$orderItems"
    },
    {
      $lookup: {
        from: "drugs",
        localField: "orderItems.item",
        foreignField: "_id",
        as: "drug"
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.item",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $gt: [{ $size: "$drug" }, 0] },
            { $arrayElemAt: ["$drug.category", 0] },
            { $arrayElemAt: ["$product.category", 0] }
          ]
        },
        totalSales: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
        totalOrders: { $sum: 1 },
        totalItems: { $sum: "$orderItems.qty" }
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category"
      }
    },
    {
      $project: {
        categoryName: { $arrayElemAt: ["$category.name", 0] },
        totalSales: 1,
        totalOrders: 1,
        totalItems: 1
      }
    },
    {
      $sort: { totalSales: -1 }
    }
  ]);

  res.json({
    categoryAnalytics,
    dateRange: {
      startDate: startDate || 'all time',
      endDate: endDate || 'all time'
    }
  });
});

export {
  getSalesAnalytics,
  getCategoryAnalytics
}; 