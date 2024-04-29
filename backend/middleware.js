const jwt = require('jsonwebtoken');
const schemas = require('./models/schemas');




function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).send({ message: 'Access token not provided' });
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error('Error verifying access token:', err.message);
        return res.status(403).send({ message: 'Invalid access token' });
      }
      console.log('Decoded user:', decoded);
      req.user = decoded;
      next();
    });
  }


async function refreshTokenExistsInDatabase(token) {
    try {
        const refreshToken = await schemas.RefreshToken.schemas.findOne({ token });
        return refreshToken !== null; // Returns true if refreshToken is found, false otherwise
    } catch (error) {
        console.error('Error checking refresh token in database:', error);
        return false; // Return false in case of any error
    }
}


function verifyRefreshToken(req, res, next) {
    const refreshToken = req.body.token;
    console.log('Received refresh token:', refreshToken);
    if (!refreshToken) return res.sendStatus(401);

    refreshTokenExistsInDatabase(refreshToken)
        .then(tokenExists => {
            if (!tokenExists) {
                console.log('Refresh token not found in the database');
                return res.sendStatus(403);
            }

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) {
                    console.error('Error verifying refresh token:',err);
                    return res.sendStatus(401);
                }
                
                console.log('Decoded user from refresh token:', user);
                req.user = user;

                const accessToken = generateAccessToken(req.user);
                if (!accessToken) return res.status(500).json({ message: 'Failed to generate access token' });
                
                req.accessToken = accessToken;
                next();
            });
        })
        .catch(error => {
            console.error('Error checking refresh token in database:', error);
            return res.sendStatus(500); // Handle database error
        });

}


function generateAccessToken(user) {
    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
    console.log('Generated access token:', accessToken);
    return accessToken;
}


module.exports = { authenticateToken, verifyRefreshToken, generateAccessToken };