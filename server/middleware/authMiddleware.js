// server/middleware/authMiddleware.js

// Import the Firebase Admin SDK (specifically the auth module)
import admin from 'firebase-admin';

/**
 * Middleware to protect API routes by verifying Firebase ID tokens.
 * This ensures that only authenticated users can access certain endpoints.
 */
const protect = async (req, res, next) => {
  let idToken;

  // Check if the Authorization header is present and starts with 'Bearer'
  // Clients will send their Firebase ID token in this header: Authorization: Bearer <ID_TOKEN>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the ID token from the Authorization header
      idToken = req.headers.authorization.split(' ')[1];

      // Verify the ID token using Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Attach the user's UID (User ID) to the request object
      // This makes the user's ID available to subsequent route handlers and controllers.
      req.userId = decodedToken.uid;
      req.userEmail = decodedToken.email; // Optionally attach email

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      // If token is invalid or expired, send a 401 Unauthorized response
      return res.status(401).json({ message: 'Not authorized, token failed or expired.' });
    }
  }

  // If no token is provided in the header
  if (!idToken) {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

// Export the protect middleware
export { protect };
