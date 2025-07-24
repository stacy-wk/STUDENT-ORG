import admin from 'firebase-admin';

// Middleware to authN Firebase ID tokens
const authenticateToken = async (req, res, next) => {
  console.log('[AuthMiddleware] Checking for Authorization Header...');
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AuthMiddleware] No Bearer token found or header malformed. Access Denied.');
    return res.status(401).json({ message: 'Unauthorized: No token provided or malformed header.' });
  }

  const idToken = authHeader.split(' ')[1];
  console.log(`[AuthMiddleware] Extracted Token: ${idToken.substring(0, 20)}...`); 

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log(`[AuthMiddleware] Token verified for UID: ${decodedToken.uid}`);

    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email; 
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error verifying Firebase ID token:', error.message);
    console.error(error.stack); 
    let errorMessage = 'Unauthorized: Invalid or expired token.';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Unauthorized: Your session has expired. Please log in again.';
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'Unauthorized: Invalid token format.';
    }
    return res.status(401).json({ message: errorMessage });
  }
};

export {
  authenticateToken,
};
