const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;
