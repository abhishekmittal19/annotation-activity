const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.cookies?.aurora_token;

  console.log("BACKEND COOKIE EXISTS:", !!token);

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);

    console.log("BACKEND USER:", req.user);

    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = { authenticate };
