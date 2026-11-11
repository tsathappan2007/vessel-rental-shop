const express = require('express');
const router = express.Router();
const controller = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth');

// Public/Client routes
router.post('/check-availability', controller.checkAvailability);
router.post('/', controller.createBooking);
router.get('/:id', controller.getBookingById);

// Protected Admin routes
router.get('/', authMiddleware, controller.getAllBookings);
router.put('/:id', authMiddleware, controller.updateBooking);
router.put('/:id/return', authMiddleware, controller.updateReturn);
router.delete('/:id', authMiddleware, controller.deleteBooking);

module.exports = router;