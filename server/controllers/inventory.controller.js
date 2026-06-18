const Inventory = require('../models/Inventory.model');
const Booking = require('../models/Booking.model');

exports.getAllInventory = async (req, res) => {
  try {
    const items = await Inventory.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInventory = async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkInsert = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }
    const result = await Inventory.insertMany(items, { ordered: false });
    res.status(201).json({ success: true, inserted: result.length, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.checkStockForDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const eventDate  = new Date(date);
    const startOfDay = new Date(eventDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay   = new Date(eventDate); endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      eventDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Booked', 'Issued', 'Partially Returned'] },
    });

    const bookedMap = {};
    for (const booking of existingBookings) {
      for (const item of booking.items) {
        const id = item.itemId.toString();
        bookedMap[id] = (bookedMap[id] || 0) + item.quantity;
      }
    }

    const allItems = await Inventory.find({ isActive: true });

    const availability = allItems.map((item) => {
      const id               = item._id.toString();
      const booked           = bookedMap[id] || 0;
      const available        = item.totalStock - booked;
      const percentAvailable = item.totalStock > 0
        ? (available / item.totalStock) * 100 : 0;
      const isLow            = percentAvailable < item.alertThreshold;

      return {
        _id:              item._id,
        name:             item.name,
        pricePerUnit:     item.pricePerUnit || 0,
        totalStock:       item.totalStock,
        bookedQty:        booked,
        availableQty:     available,
        percentAvailable: Math.round(percentAvailable),
        isLow,
        alertThreshold:   item.alertThreshold,
        externalVendor:   item.externalVendor,
      };
    });

    res.json({ success: true, date, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};