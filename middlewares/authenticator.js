const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth'); // Import your JWT secret
const { User } = require('../models'); // Adjust the path as needed

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, jwtSecret, async (err, decoded) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }

      const userId = decoded.userId;

      try {
        const user = await User.findByPk(userId);

        if (!user) {
          return res.sendStatus(404); // User not found
        }

        req.user = user;
        next();
      } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = authenticateToken;
