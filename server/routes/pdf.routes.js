const express = require('express');
const router = express.Router();
const fs = require('fs');
const Booking = require('../models/Booking.model');
const { generatePDF } = require('../utils/pdfGenerator');

router.get('/download/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('items.itemId', 'name');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Always generate fresh PDF with latest data
    const pdfPath = await generatePDF(booking);

    res.download(pdfPath, `booking_${booking.bookingNumber}.pdf`, (err) => {
      if (err) {
        console.error('PDF download error:', err);
      }
      // Delete from disk after download completes or fails
      try {
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }
      } catch (fsErr) {
        console.error('Failed to clean up PDF file:', fsErr);
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/regenerate/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('items.itemId', 'name');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const pdfPath = await generatePDF(booking);
    booking.pdfPath = pdfPath;
    await booking.save();

    res.json({ success: true, pdfPath });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;