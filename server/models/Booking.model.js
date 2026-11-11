const mongoose = require('mongoose');

const bookingItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  itemName: { type: String },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  returnedQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  pricePerUnit: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    returnDate: {
      type: Date,
    },
    eventType: {
      type: String,
      default: 'General',
    },
    items: [bookingItemSchema],
    advanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    receivedAmount: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Additional amount received after advance (balance payments)',
    },
    status: {
      type: String,
      enum: ['Booked', 'Issued', 'Partially Returned', 'Returned'],
      default: 'Booked',
    },
    notes: {
      type: String,
      default: '',
    },
    pdfPath: {
      type: String,
      default: '',
    },
    shortageItems: [
      {
        itemId: mongoose.Schema.Types.ObjectId,
        itemName: String,
        shortageQty: Number,
      },
    ],
  },
  { timestamps: true }
);

const Counter = require('./Counter.model');

bookingSchema.pre('save', async function (next) {
  if (!this.bookingNumber) {
    try {
      let counter = await Counter.findById('bookingNumber');
      if (!counter) {
        // Initialize counter based on highest existing booking number
        const latestBooking = await mongoose.model('Booking')
          .findOne({ bookingNumber: { $regex: /^BK\d+$/ } })
          .sort({ bookingNumber: -1 });
        let initialSeq = 0;
        if (latestBooking && latestBooking.bookingNumber) {
          const num = parseInt(latestBooking.bookingNumber.replace('BK', ''), 10);
          if (!isNaN(num)) initialSeq = num;
        }
        counter = await Counter.findByIdAndUpdate(
          { _id: 'bookingNumber' },
          { $set: { seq: initialSeq + 1 } },
          { new: true, upsert: true }
        );
      } else {
        counter = await Counter.findByIdAndUpdate(
          { _id: 'bookingNumber' },
          { $inc: { seq: 1 } },
          { new: true }
        );
      }
      this.bookingNumber = `BK${String(counter.seq).padStart(5, '0')}`;
      if (typeof next === 'function') next();
    } catch (err) {
      if (typeof next === 'function') return next(err);
      throw err;
    }
  } else {
    if (typeof next === 'function') next();
  }
});

bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ returnDate: 1 });
bookingSchema.index({ eventDate: 1, returnDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingNumber: 1 });

module.exports = mongoose.model('Booking', bookingSchema);