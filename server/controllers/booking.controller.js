const Booking = require('../models/Booking.model');
const Inventory = require('../models/Inventory.model');
const { generatePDF } = require('../utils/pdfGenerator');

// Helper: calculate availability for date
async function getAvailabilityForDate(date, excludeBookingId = null) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    eventDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['Booked', 'Issued', 'Partially Returned'] },
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const bookings = await Booking.find(query);
  const bookedMap = {};
  for (const b of bookings) {
    for (const item of b.items) {
      const id = item.itemId.toString();
      bookedMap[id] = (bookedMap[id] || 0) + item.quantity;
    }
  }
  return bookedMap;
}

// GET all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, date, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      filter.eventDate = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { bookingNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('items.itemId', 'name category')
      .sort({ eventDate: 1, createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single booking
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('items.itemId', 'name category totalStock');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST check availability before booking
exports.checkAvailability = async (req, res) => {
  try {
    const { eventDate, items } = req.body;
    if (!eventDate || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'eventDate and items are required' });
    }

    const bookedMap = await getAvailabilityForDate(eventDate);
    const allItems = await Inventory.find({ isActive: true });
    const itemMap = {};
    allItems.forEach((i) => (itemMap[i._id.toString()] = i));

    const results = [];
    const shortages = [];

    for (const reqItem of items) {
      const invItem = itemMap[reqItem.itemId];
      if (!invItem) {
        results.push({ itemId: reqItem.itemId, error: 'Item not found' });
        continue;
      }
      const alreadyBooked = bookedMap[reqItem.itemId] || 0;
      const available = invItem.totalStock - alreadyBooked;
      const needed = reqItem.quantity;
      const canFulfill = available >= needed;
      const shortageQty = canFulfill ? 0 : needed - available;

      results.push({
        itemId: reqItem.itemId,
        name: invItem.name,
        totalStock: invItem.totalStock,
        alreadyBooked,
        availableQty: available,
        requestedQty: needed,
        canFulfill,
        shortageQty,
        externalVendor: invItem.externalVendor,
      });

      if (!canFulfill) {
        shortages.push({ itemId: reqItem.itemId, itemName: invItem.name, shortageQty, externalVendor: invItem.externalVendor });
      }
    }

    res.json({
      success: true,
      available: shortages.length === 0,
      shortages,
      details: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create booking
exports.createBooking = async (req, res) => {
  try {
    const { customerName, phone, eventDate, items, advanceAmount, totalAmount, receivedAmount, notes, eventType, returnDate } = req.body;

    // Enrich item names
    const enrichedItems = [];
    for (const item of items) {
      const inv = await Inventory.findById(item.itemId);
      enrichedItems.push({
        itemId: item.itemId,
        itemName: inv ? inv.name : 'Unknown',
        quantity: item.quantity,
        pricePerUnit: inv ? inv.pricePerUnit : 0,
        totalPrice: (inv ? inv.pricePerUnit : 0) * item.quantity,
        returnedQuantity: 0,
      });
    }

    // Calculate shortages for reference
    const bookedMap = await getAvailabilityForDate(eventDate);
    const shortageItems = [];
    for (const item of items) {
      const inv = await Inventory.findById(item.itemId);
      if (!inv) continue;
      const alreadyBooked = bookedMap[item.itemId] || 0;
      const available = inv.totalStock - alreadyBooked;
      if (available < item.quantity) {
        shortageItems.push({
          itemId: item.itemId,
          itemName: inv.name,
          shortageQty: item.quantity - available,
        });
      }
    }

    const booking = new Booking({
      customerName,
      phone,
      eventDate,
      returnDate,
      eventType,
      items: enrichedItems,
      advanceAmount,
      totalAmount,
      receivedAmount: receivedAmount || 0,
      notes,
      shortageItems,
    });

    await booking.save();

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT update booking
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update return status
exports.updateReturn = async (req, res) => {
  try {
    const { returnedItems } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Update returned quantities
    for (const returned of returnedItems) {
      const item = booking.items.find((i) => i.itemId.toString() === returned.itemId);
      if (item) item.returnedQuantity = returned.returnedQuantity;
    }

    // Determine status
    const totalItems = booking.items.length;
    const fullyReturnedCount = booking.items.filter((i) => i.returnedQuantity >= i.quantity).length;
    const hasAnyReturn = booking.items.some((i) => i.returnedQuantity > 0);

    if (fullyReturnedCount === totalItems) {
      booking.status = 'Returned';
    } else if (hasAnyReturn) {
      booking.status = 'Partially Returned';
    }

    await booking.save();
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};