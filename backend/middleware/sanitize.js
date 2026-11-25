// Rejects MongoDB operator injection (fix #4): keys such as {"$ne": ...} or {"$regex": ...}
// anywhere in the body, query string or URL params.
const hasBadKey = (value, depth = 0) => {
  if (depth > 8) return true;
  if (Array.isArray(value)) return value.some((v) => hasBadKey(v, depth + 1));
  if (value && typeof value === 'object') {
    return Object.keys(value).some((k) => k.startsWith('$') || k.includes('.') || hasBadKey(value[k], depth + 1));
  }
  return false;
};

module.exports = (req, res, next) => {
  if (hasBadKey(req.body) || hasBadKey(req.query) || hasBadKey(req.params)) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }
  next();
};
