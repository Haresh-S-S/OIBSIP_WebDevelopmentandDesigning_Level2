/**
 * authMiddleware.js
 * ---------------------------------------------------------
 * Middleware that protects routes which require the user
 * to be logged in. Checks for a valid session containing
 * a userId. If missing, the request is rejected with 401.
 * ---------------------------------------------------------
 */

function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    // Session is valid, user is authenticated -> continue
    return next();
  }

  // No valid session found
  return res.status(401).json({
    success: false,
    message: 'Unauthorized. Please log in to continue.'
  });
}

module.exports = { isAuthenticated };
