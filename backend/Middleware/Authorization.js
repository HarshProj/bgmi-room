const jwt = require("jsonwebtoken");
const hash = process.env.HASH; // Changed from hash to HASH

const authorization = (req, res, next) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. Invalid token format." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, hash);
    
    
    // Now decoded will have: id, username, email, role
    // Access them directly from decoded, NOT decoded.user
    
    // Check if user is admin
    if (decoded.role === 'admin') {
      // Pass admin info to next middleware or route
      req.admin = decoded;
      return next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You are not authorized as admin.",
      });
    }
    
  } catch (error) {
    console.error("Authorization error:", error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired. Please login again.' 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized access' 
    });
  }
};

module.exports = authorization;