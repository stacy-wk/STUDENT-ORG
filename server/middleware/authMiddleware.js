import admin from 'firebase-admin';

/* Middleware to protect API routes by verifying Firebase ID tokens */
const protect = async (req, res, next) => {
  let idToken;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract ID token from Authorization header
      idToken = req.headers.authorization.split(' ')[1];

      // Verify ID token using Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.userId = decodedToken.uid;
      req.userEmail = decodedToken.email; 

      next();
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      return res.status(401).json({ message: 'Not authorized, token failed or expired.' });
    }
  }

  if (!idToken) {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

export { protect };


/* Middleware to authenticate Firebase ID tokens */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided or token format is invalid.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next(); 
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Unauthorized: Token expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid token.', error: error.message });
  }
};
