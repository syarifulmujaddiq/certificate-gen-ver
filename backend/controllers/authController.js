const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  // Cek username
  if (username !== process.env.ADMIN_USERNAME) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Cek password hash
  const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Jika valid, buat JWT
  const payload = { username };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

  res.json({ token, username });
};
