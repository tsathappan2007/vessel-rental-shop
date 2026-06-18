const express = require('express');
const router = express.Router();
const controller = require('../controllers/booking.controller');

router.get('/', controller.getAllBookings);
router.get('/:id', controller.getBookingById);
router.post('/check-availability', controller.checkAvailability);
router.post('/', controller.createBooking);
router.put('/:id', controller.updateBooking);
router.put('/:id/return', controller.updateReturn);
router.delete('/:id', controller.deleteBooking);

module.exports = router;