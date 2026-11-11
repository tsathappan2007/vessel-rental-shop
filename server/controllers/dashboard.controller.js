const Booking = require('../models/Booking.model');
const Inventory = require('../models/Inventory.model');
const { getAvailabilityForRange } = require('./booking.controller');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalInventory = await Inventory.countDocuments({ isActive: true });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['Booked', 'Issued'] } });

    const today = new Date();
    const bookedMap = await getAvailabilityForRange(today, today);

    const inventory = await Inventory.find({ isActive: true });
    const lowStockItems = [];

    // Real-time low stock calculation based on today's active reservations
    for (const item of inventory) {
      const booked = bookedMap[item._id.toString()] || 0;
      const available = Math.max(0, item.totalStock - booked);
      const threshold = (item.alertThreshold / 100) * item.totalStock;
      if (available <= threshold || item.totalStock === 0) {
        lowStockItems.push({
          name: item.name,
          totalStock: item.totalStock,
          availableStock: available,
          threshold: item.alertThreshold,
        });
      }
    }

    // Busiest dates - aggregate bookings per event date
    const busiestDates = await Booking.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$eventDate' } }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    // Monthly booking trend
    const monthlyTrend = await Booking.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    // Status distribution
    const statusDist = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Revenue stats — balance now accounts for advance + receivedAmount
    const revenueStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue:  { $sum: '$totalAmount' },
          totalAdvance:  { $sum: '$advanceAmount' },
          totalReceived: { $sum: { $ifNull: ['$receivedAmount', 0] } },
          totalBalance: {
            $sum: {
              $subtract: [
                '$totalAmount',
                {
                  $add: [
                    '$advanceAmount',
                    { $ifNull: ['$receivedAmount', 0] },
                  ],
                },
              ],
            },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        totalInventory,
        activeBookings,
        lowStockItems,
        lowStockCount: lowStockItems.length,
        busiestDates,
        monthlyTrend,
        statusDist,
        revenueStats: revenueStats[0] || {
          totalRevenue:  0,
          totalAdvance:  0,
          totalReceived: 0,
          totalBalance:  0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDateUtilization = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end   = endDate   ? new Date(endDate)   : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const bookings = await Booking.find({
      eventDate: { $gte: start, $lte: end },
      status: { $in: ['Booked', 'Issued', 'Partially Returned'] },
    });

    const totalStock = await Inventory.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalStock' } } },
    ]);
    const maxCapacity = totalStock[0]?.total || 1;

    const utilizationMap = {};
    for (const b of bookings) {
      const dateKey = b.eventDate.toISOString().split('T')[0];
      if (!utilizationMap[dateKey]) utilizationMap[dateKey] = 0;
      for (const item of b.items) {
        utilizationMap[dateKey] += item.quantity;
      }
    }

    const utilization = Object.entries(utilizationMap).map(([date, qty]) => ({
      date,
      totalBooked: qty,
      utilizationPercent: Math.min(Math.round((qty / maxCapacity) * 100), 100),
    }));

    res.json({ success: true, data: utilization });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};