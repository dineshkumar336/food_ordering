const { userFromToken } = require('../utils/token');
const audit = require('../utils/audit');

const authenticate = (allowedScopes) => async (req, res, next) => {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const result = await userFromToken(token);
    // Unknown user, deactivated account and revoked token all look the same on purpose.
    if (!result) return res.status(401).json({ success: false, message: 'Invalid or expired token' });

    if (!allowedScopes.includes(result.scope)) {
      return res.status(403).json({
        success: false,
        message: result.scope === 'mfa_setup' ? 'Set up two-step sign-in before using this' : 'Access denied',
        mfaSetupRequired: result.scope === 'mfa_setup',
      });
    }
    req.user = result.user;
    req.tokenScope = result.scope;
    req.tokenExp = result.exp;
    next();
  } catch (error) {
    if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const auth = authenticate(['full']);                       // the whole API
const authAnyScope = authenticate(['full', 'mfa_setup']);  // only /me, logout and the MFA setup routes

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    audit.record('access.denied', { req, actor: req.user, success: false, detail: { path: req.originalUrl.split('?')[0], needs: roles } });
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

module.exports = { auth, authAnyScope, requireRole };
