const express = require('express');
const multer = require('multer');
const router = express.Router();
const jwt = require('jsonwebtoken');
const schemas = require('../models/schemas');
const bcrypt = require('bcrypt');
const { authenticateToken } = require('../middleware');
const { verifyRefreshToken } = require('../middleware');
const { generateAccessToken } = require('../middleware');
const saltRounds = 10; // Adjust as needed
const {GridFsStorage} = require('multer-gridfs-storage');
require('dotenv/config')



const findOne = async (query) => {
    try {
        const user = await schemas.Users.findOne(query);
        return user;
    } catch (error) {
        throw new Error('Error finding user: ' + error.message);
    }
};
// Register_API
router.post('/register', async(req, res) => {
    const {name, email, pwd} = req.body
    const hashedPassword = await bcrypt.hash(pwd, saltRounds);

    const registerData = { name, email, pwd: hashedPassword };
        const newRegister = new schemas.Users(registerData)
        const saveRegister = await newRegister.save()
        
        if (saveRegister) {
            // console.log(name +' | '+ email +' | '+ pwd)
            res.send('Message sent.')
        } else {
            res.send('Failed to send.')
        }
    res.end()
  });

  router.post('/login', async (req, res) => {
    const { email, pwd } = req.body;

  try {
    const user = await findOne({ email }); // Find user by email
    console.log('User:', user);
    console.log('Password:', pwd);
    console.log('User Password:', user.pwd);
    // Check if user exists
    if (!user) {
        return res.status(401).json({ message: 'invalid email or password' });
      }
      else {
        const validPassword = await bcrypt.compare(pwd, user.pwd);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        } else {
            const accessToken = generateAccessToken(user);
            if (!accessToken) {
                return res.status(500).json({ message: 'Failed to generate access token' });
            }

            // Generate refresh token (you may need to store this in a database)
            const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET);
            if (!refreshToken) {
                return res.status(500).json({ message: 'Failed to generate refresh token' });
            }
            

            // Store refresh token in the database
            const newRefreshToken = new schemas.Tokens({
                userId: user._id,
                token: refreshToken,
                createdAt: new Date(),
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day expiration
            });
            await newRefreshToken.save();

            // Send the access token and refresh token back to the client
            res.json({ accessToken, refreshToken });
        }
    }
} catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
}
});

// Route to refresh access token using refresh token
router.post('/token', verifyRefreshToken, async (req, res) => {
    // Logic to generate a new access token
    console.log('Decoded user:', req.user);
    const accessToken = req.accessToken;
    res.json({ accessToken });
    
});




router.get('/protected', authenticateToken, (req, res) => {
  console.log('Request Headers:', req.headers);
  res.json({ message: 'You are authorized to access this protected route' });
});

router.delete('/logout', async (req, res) => {
    try {
        // Assuming refreshTokenModel is your model for refresh tokens
        const result = await schemas.Tokens.findOneAndDelete({ token: req.body.token });
        
        if (result) {
            // Refresh token successfully deleted
            res.status(200).json({ message: 'Refresh token successfully deleted' });
        } else {
            // Refresh token not found
            res.status(404).json({ message: 'Refresh token not found' });
        }
    } catch (error) {
        console.error('Error deleting refresh token:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});






// Storage configuration for images
const fileStorage = new GridFsStorage({
  url: process.env.DB_URI,
  file: (req, file) => {;
      const filename = `${Date.now()}_${file.originalname}`;
      const metadata = {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
          // Add any other metadata properties you want to include
      };
      const fileInfo = {
          filename: filename,
          metadata: metadata,
          bucketName: 'files' // specify the bucket name
      };
      return fileInfo;
  },
  onError: (error) => {
      console.error('Error storing file:', error);
  }
});
const upload = multer({ storage: fileStorage });

router.post('/filesupload', upload.single('file'), (req, res) => {
  if (req.fileValidationError) {
      return res.status(400).json({
          message: req.fileValidationError,
      });
  }
  // get the file from the request
  const file = req.file;

  // create a new MongoDB GridFS file
  const writeStream = gfs.createWriteStream({
      filename: file.filename,
      metadata: file.metadata, // Access metadata from the uploaded file
      contentType: file.mimetype,
  });

  // pipe the file data to the GridFS file
  readStream.pipe(writeStream);

  writeStream.on('close', (file) => {
      // file is saved, return the file details
      return res.json({ message: 'File uploaded successfully', file });
  });
});

module.exports = router;