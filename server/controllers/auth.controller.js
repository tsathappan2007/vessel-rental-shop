const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email.trim().toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_key_vessel_rental_shop';
    const token = jwt.sign(
      { role: 'admin', email: adminEmail },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { email: adminEmail, role: 'admin' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyToken = async (req, res) => {
  res.json({ success: true, user: req.user });
};
