import Order from '../models/orderModel.js';

/**
 * Get sales analytics
 * - total sales amount
 * - total number of orders
 * - total quantity of drugs sold
 * - breakdown of sales per day
 */
export const getSalesAnalytics = async (req, res) => {
  try {
    const analytics = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $sum: "$items.quantity" } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const overall = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $sum: "$items.quantity" } }
        }
      }
    ]);

    res.json({
      overall: overall.length > 0 ? overall[0] : { totalSales: 0, totalOrders: 0, totalQuantity: 0 },
      daily: analytics
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
};
