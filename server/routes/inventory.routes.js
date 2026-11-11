const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventory.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', controller.getAllInventory);
router.get('/check-stock', controller.checkStockForDate);
router.get('/:id', controller.getInventoryById);

// Protected routes
router.post('/', authMiddleware, controller.createInventory);
router.post('/bulk', authMiddleware, controller.bulkInsert);
router.put('/:id', authMiddleware, controller.updateInventory);
router.delete('/:id', authMiddleware, controller.deleteInventory);

module.exports = router;