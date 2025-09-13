const authMiddleware = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'Неавторизованный доступ' });
    }
    next();
  };
  
  module.exports = authMiddleware;
  