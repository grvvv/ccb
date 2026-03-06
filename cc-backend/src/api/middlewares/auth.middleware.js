const jwt = require('jsonwebtoken');
const config = require('@config')

const access = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied' });
  try {
    const decoded = jwt.verify(token.split(' ')[1], config.jwt.access.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name == "TokenExpiredError") return res.status(401).json({ message: "Token Expired" });
    return res.status(400).json({ message: 'Invalid token', error: error.message });
  }
};

const storageBarrier = (req, res, next) => {
  const token = req.query.token;
  if (!token) return res.status(401).json({ message: 'Access denied' });
  try {
    let decode = jwt.verify(token, config.jwt.storage.secret);
    next();
  } catch (error) {
    if (error.name == "TokenExpiredError") return res.status(403).json({ message: "Session Expired", token: jwt.decode(token) });
    res.status(400).json({ message: 'Invalid token' });
  }
};


module.exports = { access, storageBarrier };