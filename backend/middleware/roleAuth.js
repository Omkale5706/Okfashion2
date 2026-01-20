const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // If roles array is empty, all authenticated users are allowed
    if (roles.length === 0) {
      return next();
    }

    // Check if user's role is in the allowed roles array
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    }
  };
};

module.exports = { authorize };
