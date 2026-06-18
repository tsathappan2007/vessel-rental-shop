require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory.model');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Set pricePerUnit = 0 for any existing item that doesn't have it
    const result = await Inventory.updateMany(
      { pricePerUnit: { $exists: false } },
      { $set: { pricePerUnit: 0 } }
    );
    console.log(`Migration done: ${result.modifiedCount} items updated with pricePerUnit = 0`);

    // Remove category field from all documents safely
    const catResult = await Inventory.updateMany(
      { category: { $exists: true } },
      { $unset: { category: '' } }
    );
    console.log(`Migration done: ${catResult.modifiedCount} items had category field removed`);

    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();