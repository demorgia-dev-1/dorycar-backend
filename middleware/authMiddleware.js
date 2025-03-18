const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Define public paths that should bypass authentication
  const publicPaths = [
    '/drivers/register',
    '/drivers/login',
    '/riders/register',
    '/riders/login'
  ];

  const requestedPath = req.originalUrl;
  console.log(`Incoming request for: ${requestedPath}`); // Debug log

  // If the requested path starts with one of the public paths, skip authentication.
  if (publicPaths.some(path => requestedPath.startsWith(path))) {
    console.log('Public route, skipping authentication.');
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
