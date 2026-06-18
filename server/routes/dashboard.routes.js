const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');

router.get('/stats', controller.getDashboardStats);
router.get('/utilization', controller.getDateUtilization);

router.get('/shop-info', (req, res) => {
  res.json({
    success: true,
    data: {
      name:    process.env.SHOP_NAME    || 'Vessel Rental Shop',
      phone:   process.env.SHOP_PHONE   || '',
      address: process.env.SHOP_ADDRESS || '',
    },
  });
});

module.exports = router;