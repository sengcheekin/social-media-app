import jwt from "jsonwebtoken";

// Middleware to verify token and check if user is logged in
export const verifyToken = (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).json({ error: "Access Denied" });
    }

    if (token.startsWith("Bearer")) {
      token = token.split(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
