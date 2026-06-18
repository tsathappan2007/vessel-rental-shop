const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    totalStock: {
      type: Number,
      required: [true, 'Total stock is required'],
      min: [0, 'Stock cannot be negative'],
    },
    pricePerUnit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    alertThreshold: {
      type: Number,
      default: 20,
      min: 1,
      max: 100,
    },
    externalVendor: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

inventorySchema.index({ name: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);