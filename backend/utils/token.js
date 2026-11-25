// JWT helpers shared by the HTTP middleware and the socket server.
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ALGORITHM = 'HS256';
const SCOPES = ['full', 'mfa_setup'];

/** scope 'full'      = password (and authenticator code, if enabled) checked: the whole API is usable.
 *  scope 'mfa_setup' = password OK but two-step sign-in is required and not set up yet: ONLY the MFA setup routes work. */
const signToken = (user, scope = 'full') =>
  jwt.sign({ userId: String(user._id), tv: user.tokenVersion || 0, scope }, process.env.JWT_SECRET, {
    algorithm: ALGORITHM,
    expiresIn: scope === 'full' ? (process.env.JWT_EXPIRES_IN || '60m') : '10m',
  });

/** Returns { user, scope, exp } for a valid token, or null. Throws jwt errors for bad/expired tokens. */
const userFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [ALGORITHM] });
  if (typeof decoded.userId !== 'string' || !SCOPES.includes(decoded.scope)) return null;
  const user = await User.findById(decoded.userId);                  // password and TOTP secret are not selected by default
  if (!user || !user.isActive) return null;
  if ((decoded.tv || 0) !== (user.tokenVersion || 0)) return null;   // revoked by logout / password change / reset
  return { user, scope: decoded.scope, exp: decoded.exp };
};

module.exports = { signToken, userFromToken };
