require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory.model');
const Booking = require('../models/Booking.model');

const seedData = [
  { name: 'Large Steel Plate',      totalStock: 500, pricePerUnit: 5,   alertThreshold: 20 },
  { name: 'Medium Steel Plate',     totalStock: 400, pricePerUnit: 4,   alertThreshold: 20 },
  { name: 'Small Steel Plate',      totalStock: 300, pricePerUnit: 3,   alertThreshold: 20 },
  { name: 'Banana Leaf Plate',      totalStock: 1000, pricePerUnit: 1,  alertThreshold: 15 },
  { name: 'Steel Tumbler (250ml)',  totalStock: 600, pricePerUnit: 3,   alertThreshold: 20 },
  { name: 'Steel Tumbler (500ml)',  totalStock: 500, pricePerUnit: 4,   alertThreshold: 20 },
  { name: 'Water Jug (5L)',         totalStock: 100, pricePerUnit: 20,  alertThreshold: 25, externalVendor: 'Ravi Enterprises' },
  { name: 'Cooking Vessel (20L)',   totalStock: 50,  pricePerUnit: 80,  alertThreshold: 30, externalVendor: 'Ravi Enterprises' },
  { name: 'Cooking Vessel (50L)',   totalStock: 30,  pricePerUnit: 150, alertThreshold: 30, externalVendor: 'Murugan Rentals' },
  { name: 'Biryani Pot (100L)',     totalStock: 15,  pricePerUnit: 300, alertThreshold: 35, externalVendor: 'Murugan Rentals' },
  { name: 'Serving Spoon Set',      totalStock: 200, pricePerUnit: 10,  alertThreshold: 20 },
  { name: 'Ladle Set',              totalStock: 150, pricePerUnit: 10,  alertThreshold: 20 },
  { name: 'Steel Bowl',             totalStock: 400, pricePerUnit: 3,   alertThreshold: 20 },
  { name: 'Coffee Cup',             totalStock: 300, pricePerUnit: 2,   alertThreshold: 20 },
  { name: 'Stainless Steel Tray',   totalStock: 80,  pricePerUnit: 25,  alertThreshold: 25 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Inventory.insertMany(seedData, { ordered: false });
    console.log('Cleared existing inventory');

    const items = await Inventory.insertMany(seedData);
    console.log(`Inserted ${items.length} inventory items`);

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();