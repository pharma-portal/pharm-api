import cron from 'node-cron';
import Order from '../models/orderModel.js';
import GuestOrder from '../models/guestOrderModel.js';

// Time intervals (in hours) for status transitions
const STATUS_INTERVALS = {
  pending_to_processing: 1,    // 1 hour after order creation
  processing_to_shipped: 24,   // 24 hours after processing
  shipped_to_delivered: 72     // 72 hours after shipping
};

// Update orders based on their current status and time
const updateOrderStatuses = async () => {
  try {
    const now = new Date();

    // Update pending orders to processing
    await updateStatus('pending', 'processing', STATUS_INTERVALS.pending_to_processing);

    // Update processing orders to shipped
    await updateStatus('processing', 'shipped', STATUS_INTERVALS.processing_to_shipped);

    // Update shipped orders to delivered
    await updateStatus('shipped', 'delivered', STATUS_INTERVALS.shipped_to_delivered);

    console.log('Order statuses updated successfully');
  } catch (error) {
    console.error('Error updating order statuses:', error);
  }
};

// Helper function to update status based on time elapsed
const updateStatus = async (currentStatus, newStatus, hoursThreshold) => {
  const thresholdDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

  // Update regular orders
  await Order.updateMany(
    {
      status: currentStatus,
      updatedAt: { $lte: thresholdDate },
      isDelivered: false
    },
    {
      $set: {
        status: newStatus,
        isDelivered: newStatus === 'delivered',
        deliveredAt: newStatus === 'delivered' ? new Date() : undefined
      }
    }
  );

  // Update guest orders
  await GuestOrder.updateMany(
    {
      status: currentStatus,
      updatedAt: { $lte: thresholdDate }
    },
    {
      $set: {
        status: newStatus,
        isDelivered: newStatus === 'delivered',
        deliveredAt: newStatus === 'delivered' ? new Date() : undefined
      }
    }
  );
};

// Schedule the automatic updates
// Run every hour
const scheduleStatusUpdates = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running automated order status updates...');
    await updateOrderStatuses();
  });
};

export default scheduleStatusUpdates; 