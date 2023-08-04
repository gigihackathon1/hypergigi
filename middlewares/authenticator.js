const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: 'Access token not provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'your-secret-key');

    // Fetch the user data
    const user = await User.findOne({
      where: { id: decoded.id }
    });
    console.log(user,"wjefdg")

    if (!user) {
      return res.status(403).json({ status: false, message: 'User not found' });
    }

    // Add the user data to the request object for use in the subsequent middleware or route handlers
    req.user = user;

    // Continue to the next middleware
    next();
  } catch (err) {
    return res.status(403).json({ status: false, message: 'Invalid access token' });
  }
};

module.exports = {
  verifyToken,
};
