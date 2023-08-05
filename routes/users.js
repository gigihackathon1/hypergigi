const express = require('express');
const router = express.Router();
const authMiddleware  = require('../middlewares/authenticator'); // Import your authMiddleware
const { User, Vendor, Category, Subcategory, Product } = require('../models'); // Import your models
const request = require('request'); // Import the request module
const twilio = require('twilio');
const ejs = require('ejs'); // Import the fs module



router.post('/send-otp', async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({ error: 'Email is required in the request body' });
    }
    const newVendor = await Vendor.create({
      vendorName: req.body.vendorName, // Replace with the vendor name you want
      vendor_is_active: false,   // Set the active status as needed
    });

    const user = await User.findOne({ where: { email: userEmail } });
    if(user && user.googleId){
      user.phoneNo = req.body.phoneNo;
      user.roleId = req.body.roleId;
      user.vendorId = req.body.vendorId;
      await user.save();
    }
    const accountSid = "AC963a3d5ff254bdbb4a967323c9e0e245";
    const authToken = "02df0cd4d1d03246920d9f2a8aa40978";
    const client = require('twilio')(accountSid, authToken);

    const otpCode = Math.floor(1000 + Math.random() * 9000);

    // Read and render the HTML template from otptemplate.ejs
    const htmlTemplate = await ejs.renderFile(__dirname + '/otp_template.ejs', { otpCode });

    // Send OTP code via Twilio SMS with HTML template
    const message = await client.messages.create({
      body: htmlTemplate,
      from: '+14707457699', // Make sure to include the + sign and country code
      to: req.body.phoneNo,
    });

    res.status(200).json({ status:true,challenge:"OTP challenge fulfill",message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});






// Function to generate OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit OTP
};

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, 'your-secret-key', {
    expiresIn: '1h', // Token will expire in 1 hour
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, 'your-refresh-secret-key', {
    expiresIn: '7d', // Refresh token will expire in 7 days
  });
};

router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNo, otpCode } = req.body;

    // Find the user based on the phone number
    const user = await User.findOne({ where: { phoneNo: phoneNo } });

    if (!user) {
      res.status(400).json({ error: 'User not found for the provided phone number' });
      return;
    }

    // Initialize Twilio client with your Twilio credentials
    const twilioAccountSid = 'AC963a3d5ff254bdbb4a967323c9e0e245';
    const twilioAuthToken = '02df0cd4d1d03246920d9f2a8aa40978';
    const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

      // Verify the OTP code
      const verificationCheck = await twilioClient.validationRequests.create({ to: phoneNo, code: otpCode });

    if (verificationCheck.status !== 'approved') {
      res.status(400).json({ error: 'Invalid OTP or OTP verification failed' });
      return;
    }
    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Fetch vendor data based on user's vendorId
    const vendor = await Vendor.findOne({ where: { id: user.vendorId } });

    if (!vendor) {
      res.status(400).json({ error: 'Vendor not found for the user' });
      return;
    }

    // Update vendor's active status to true
    await vendor.update({ vendor_is_active: true });

    // Send the response with tokens
    res.status(200).json({
      status: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: '7d', // Expiration time of refresh token
    });
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

