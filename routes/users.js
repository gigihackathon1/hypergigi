const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authenticator'); // Import your authMiddleware
const { User, Vendor, Category, Subcategory, Product } = require('../models'); // Import your models
const request = require('request'); // Import the request module

router.post('/update/profile', authMiddleware, async (req, res, next) => {
  try {
    // Create a new vendor entry
    const newVendor = await Vendor.create({
      vendorName: req.body.vendorName,
      vendor_is_active: req.body.vendor_is_active,
      vendor_description: req.body.vendorDescription,
      // Add other vendor properties here
    });

    // Update the user's vendorId with the newly created vendor's id
    const user = await User.findByPk(req.user.id); // Assuming req.user contains the logged-in user's data
    if (user) {
      user.vendorId = newVendor.id;
      user.user_description = req.body.user_description;
      await user.save();
    }

    res.json({ message: 'Profile updated successfully', status: true });
  } catch (error) {
    next(error);
  }
});

router.post('/create/category', authMiddleware, async (req, res, next) => {
  try {
    // Create a new category entry
    const newCategory = await Category.create({
      categoryName: req.body.categoryName,
      vendorId: req.user.vendorId, // Use the vendorId from the logged-in user
    });

    res.json({ message: 'Created category successfully', status: true });
  } catch (error) {
    next(error);
  }
});

router.post('/create/subCategory', authMiddleware, async (req, res, next) => {
  try {
    // Create a new subcategory entry using the fetched categoryId
    const newSubcategory = await Subcategory.create({
      subcategoryName: req.body.subcategoryName,
      categoryId: req.categoryId, // Fetched from the getCategoryId middleware
    });

    res.json({ message: 'Created subcategory successfully', status: true });
  } catch (error) {
    next(error);
  }
});

router.post('/create/product', authMiddleware, async (req, res, next) => {
  try {
    // Create a new product entry
    const newProduct = await Product.create({
      productName: req.body.productName,
      productDescription: req.body.productDescription,
      productLocation: req.body.productLocation,
      productPincode: req.body.productPincode,
      productUrl: req.body.productUrl,
      productImageUrl: req.body.productImageUrl,
      vendorId: req.user.vendorId, // Use the vendorId from the logged-in user
    });

    // Send a request to generate images for the product
    const options = {
      method: 'POST',
      url: 'http://ec2-13-127-242-206.ap-south-1.compute.amazonaws.com/GenerateImages',
      headers: {},
      formData: {
        productDescription: req.body.productDescription,
      },
    };

    request(options, function (error, response, body) {
      if (error) {
        console.error('Error generating images:', error);
        return res.status(500).json({ error: 'Error generating images' });
      }
      
      console.log('Images generated:', body);
      res.json({ message: 'Created product successfully', status: true });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

