const express = require('express');
const router = express.Router();
const authMiddleware  = require('../middlewares/authenticator'); // Import your authMiddleware
const { User, Vendor, Category, Subcategory, Product } = require('../models'); // Import your models
const request = require('request'); // Import the request module
const twilio = require('twilio');



router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNo } = req.body;
    const otpCode = 1234
    

    // Send OTP code via Twilio SMS
    const client = twilio("AC963a3d5ff254bdbb4a967323c9e0e245", "fcbbffb1a5bdd5f2a2b3e3b98d57aac0");
    let a =await client.messages.create({
      body: `Your OTP code is: ${otpCode}`,
      from: +917676755696, // Make sure to include the + sign and country code
      to: phoneNo,
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Function to generate OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit OTP
}


router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNo, otpCode } = req.body;

    // Find the latest OTP code for the provided phone number
    const propertyField = await models.PropertyField.findOne({
      where: {
        vendorId: 1, // Replace with the actual vendorId
        otpCode,
        otpExpiration: {
          [models.Sequelize.Op.gte]: new Date(),
        },
      },
    });

    if (propertyField) {
      // Perform actions after successful OTP verification
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid OTP or OTP expired' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

router.post('/update/profile', authMiddleware.verifyToken, async (req, res, next) => {
  const { vendorName,vendor_is_active,vendor_description } = req.body;
  try {
    // console.log(req.user,"kjdefjd")
    // Create a new vendor entry
    const vendor = await Vendor.create({ vendorName,vendor_is_active,vendor_description });
    console.log(vendor,"sdugg");
    // const newVendor = await Vendor.create({
    //   vendorName: req.body.vendorName,
    //   vendor_is_active: req.body.vendor_is_active,
    //   vendor_description: req.body.vendorDescription,
    //   // Add other vendor properties here
    // });

    // // Update the user's vendorId with the newly created vendor's id
    const user = await User.findByPk(req.user.id); // Assuming req.user contains the logged-in user's data
    if (user) {
      user.vendorId = vendor.id;
      user.roleId = req.body.roleId;
      user.user_description = req.body.user_description;
      await user.save();
    }

    res.json({ message: 'Profile updated successfully', status: true });
  } catch (error) {
    console.log(error);
    throw error;
  }
});

router.post('/create/category', authMiddleware.verifyToken, async (req, res, next) => {
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

router.post('/create/subCategory', authMiddleware.verifyToken, async (req, res, next) => {
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

router.post('/create/product', authMiddleware.verifyToken, async (req, res, next) => {
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
        productDescription: newProduct.productDescription,
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

