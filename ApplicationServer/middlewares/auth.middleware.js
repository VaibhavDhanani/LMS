import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  let token =null;
  const authHeader = req.headers['authorization']; // Expect "Bearer <token>"
   token = authHeader && authHeader.split(' ')[1];
 // If no token in header, check query parameter (for SSE requests)
 if (!token && req.query.token) {
  token = req.query.token;
}
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user; // Attach user info to request object
    next();
  });
};

export default authenticateToken;
