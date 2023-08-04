const { Category } = require('../models'); // Adjust the path as needed

async function getCategoryData(req, res, next) {
  try {
    const vendorId = req.user.vendorId;

    // Fetch categories based on vendorId
    const categories = await Category.findAll({
      where: {
        vendorId: vendorId,
      },
    });

    req.categories = categories; // Attach the categories to the request object
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = getCategoryData;
