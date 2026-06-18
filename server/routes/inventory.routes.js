const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventory.controller');

router.get('/', controller.getAllInventory);
router.get('/check-stock', controller.checkStockForDate);
router.get('/:id', controller.getInventoryById);
router.post('/', controller.createInventory);
router.post('/bulk', controller.bulkInsert);
router.put('/:id', controller.updateInventory);
router.delete('/:id', controller.deleteInventory);

module.exports = router;