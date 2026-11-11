const Booking = require('../models/Booking.model');
const Inventory = require('../models/Inventory.model');

// Helper: Escape regex special characters to prevent ReDoS
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Helper: calculate availability for date or date-range overlap
async function getAvailabilityForRange(eventDate, returnDate = null, excludeBookingId = null) {
  const reqStart = new Date(eventDate);
  reqStart.setHours(0, 0, 0, 0);

  const reqEnd = returnDate ? new Date(returnDate) : new Date(eventDate);
  reqEnd.setHours(23, 59, 59, 999);

  // Overlap condition:
  // booking starts on or before reqEnd AND booking ends on or after reqStart
  const query = {
    status: { $in: ['Booked', 'Issued', 'Partially Returned'] },
    eventDate: { $lte: reqEnd },
    $or: [
      { returnDate: { $gte: reqStart } },
      {
        $and: [
          { $or: [{ returnDate: { $exists: false } }, { returnDate: null }] },
          { eventDate: { $gte: reqStart } },
        ],
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const bookings = await Booking.find(query);
  const bookedMap = {};
  for (const b of bookings) {
    for (const item of b.items) {
      if (!item.itemId) continue;
      const id = item.itemId.toString();
      bookedMap[id] = (bookedMap[id] || 0) + (Number(item.quantity) || 0);
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
    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { customerName: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
        { bookingNumber: { $regex: safeSearch, $options: 'i' } },
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
    const { eventDate, returnDate, items } = req.body;
    if (!eventDate || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'eventDate and items are required' });
    }

    if (returnDate && new Date(returnDate) < new Date(eventDate)) {
      return res.status(400).json({ success: false, message: 'Return date cannot be earlier than event date' });
    }

    const bookedMap = await getAvailabilityForRange(eventDate, returnDate);
    
    // Batch query items (eliminates N+1)
    const itemIds = items.map((i) => i.itemId).filter(Boolean);
    const invItems = await Inventory.find({ _id: { $in: itemIds }, isActive: true });
    const itemMap = {};
    invItems.forEach((i) => (itemMap[i._id.toString()] = i));

    const results = [];
    const shortages = [];

    for (const reqItem of items) {
      const invItem = itemMap[reqItem.itemId];
      if (!invItem) {
        results.push({ itemId: reqItem.itemId, error: 'Item not found or inactive' });
        continue;
      }
      const alreadyBooked = bookedMap[reqItem.itemId] || 0;
      const available = Math.max(0, invItem.totalStock - alreadyBooked);
      const needed = Number(reqItem.quantity) || 0;
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
        shortages.push({
          itemId: reqItem.itemId,
          itemName: invItem.name,
          shortageQty,
          externalVendor: invItem.externalVendor,
        });
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
    const {
      customerName,
      phone,
      eventDate,
      returnDate,
      eventType,
      items,
      advanceAmount,
      receivedAmount,
      notes,
    } = req.body;

    if (!customerName || !phone || !eventDate || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, event date, and items are required' });
    }

    if (returnDate && new Date(returnDate) < new Date(eventDate)) {
      return res.status(400).json({ success: false, message: 'Return date cannot be earlier than event date' });
    }

    // Batch query all items (eliminates N+1 query loop)
    const itemIds = items.map((i) => i.itemId).filter(Boolean);
    const invItems = await Inventory.find({ _id: { $in: itemIds } });
    const invMap = {};
    invItems.forEach((i) => (invMap[i._id.toString()] = i));

    // Server-side recalculate item totals and grand total to prevent client price tampering
    let serverTotalAmount = 0;
    const enrichedItems = [];
    for (const item of items) {
      const inv = invMap[item.itemId];
      const unitPrice = inv ? Number(inv.pricePerUnit || 0) : 0;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = unitPrice * quantity;
      serverTotalAmount += lineTotal;

      enrichedItems.push({
        itemId: item.itemId,
        itemName: inv ? inv.name : 'Unknown',
        quantity,
        pricePerUnit: unitPrice,
        totalPrice: lineTotal,
        returnedQuantity: 0,
      });
    }

    // Validate financial bounds
    const advance = Math.max(0, Number(advanceAmount || 0));
    if (advance > serverTotalAmount && serverTotalAmount > 0) {
      return res.status(400).json({ success: false, message: 'Advance amount cannot be greater than total amount' });
    }

    // Calculate shortages for vendor reference across the date range
    const bookedMap = await getAvailabilityForRange(eventDate, returnDate);
    const shortageItems = [];
    for (const item of enrichedItems) {
      const inv = invMap[item.itemId];
      if (!inv) continue;
      const alreadyBooked = bookedMap[item.itemId] || 0;
      const available = Math.max(0, inv.totalStock - alreadyBooked);
      if (available < item.quantity) {
        shortageItems.push({
          itemId: item.itemId,
          itemName: inv.name,
          shortageQty: item.quantity - available,
        });
      }
    }

    const booking = new Booking({
      customerName: customerName.trim(),
      phone: phone.trim(),
      eventDate,
      returnDate: returnDate || null,
      eventType: eventType || 'General',
      items: enrichedItems,
      advanceAmount: advance,
      totalAmount: serverTotalAmount,
      receivedAmount: Math.max(0, Number(receivedAmount || 0)),
      notes: notes || '',
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
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Protect against overwriting immutable or critical fields
    delete req.body._id;
    delete req.body.bookingNumber;
    delete req.body.createdAt;

    // Validate return date if updated
    const eventDate = req.body.eventDate || existingBooking.eventDate;
    const returnDate = req.body.returnDate !== undefined ? req.body.returnDate : existingBooking.returnDate;
    if (returnDate && new Date(returnDate) < new Date(eventDate)) {
      return res.status(400).json({ success: false, message: 'Return date cannot be earlier than event date' });
    }

    // If items are modified, re-enrich and recalculate total
    if (req.body.items && Array.isArray(req.body.items)) {
      const itemIds = req.body.items.map((i) => i.itemId).filter(Boolean);
      const invItems = await Inventory.find({ _id: { $in: itemIds } });
      const invMap = {};
      invItems.forEach((i) => (invMap[i._id.toString()] = i));

      let serverTotal = 0;
      req.body.items = req.body.items.map((item) => {
        const inv = invMap[item.itemId];
        const unitPrice = inv ? Number(inv.pricePerUnit || 0) : 0;
        const qty = Math.max(1, Number(item.quantity) || 1);
        const lineTotal = unitPrice * qty;
        serverTotal += lineTotal;
        return {
          itemId: item.itemId,
          itemName: inv ? inv.name : 'Unknown',
          quantity: qty,
          pricePerUnit: unitPrice,
          totalPrice: lineTotal,
          returnedQuantity: Number(item.returnedQuantity || 0),
        };
      });
      req.body.totalAmount = serverTotal;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updatedBooking });
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
    if (!returnedItems || !Array.isArray(returnedItems)) {
      return res.status(400).json({ success: false, message: 'returnedItems array is required' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Validate and update returned quantities
    for (const returned of returnedItems) {
      const item = booking.items.find((i) => i.itemId.toString() === returned.itemId);
      if (item) {
        const qty = Number(returned.returnedQuantity) || 0;
        if (qty < 0 || qty > item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Returned quantity for "${item.itemName || 'item'}" must be between 0 and ${item.quantity}`,
          });
        }
        item.returnedQuantity = qty;
      }
    }

    // Determine status
    const totalItems = booking.items.length;
    const fullyReturnedCount = booking.items.filter((i) => i.returnedQuantity >= i.quantity).length;
    const hasAnyReturn = booking.items.some((i) => i.returnedQuantity > 0);

    if (fullyReturnedCount === totalItems && totalItems > 0) {
      booking.status = 'Returned';
    } else if (hasAnyReturn) {
      booking.status = 'Partially Returned';
    } else {
      // If no items are returned, retain Issued or Booked status
      if (booking.status === 'Partially Returned' || booking.status === 'Returned') {
        booking.status = 'Issued';
      }
    }

    await booking.save();
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Export availability helper for other controllers
exports.getAvailabilityForRange = getAvailabilityForRange;
