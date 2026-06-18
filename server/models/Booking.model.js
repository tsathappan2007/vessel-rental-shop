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

bookingSchema.pre('save', async function () {
  if (!this.bookingNumber) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingNumber = `BK${String(count + 1).padStart(5, '0')}`;
  }
});

bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingNumber: 1 });

module.exports = mongoose.model('Booking', bookingSchema);