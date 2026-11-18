const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login to continue.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "You don't have permission to assign tasks. Please contact your admin or manager.",
      });
    }
    next();
  };
};

module.exports = { authorize };
