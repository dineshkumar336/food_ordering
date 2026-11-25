// Authentication, same method as the IAM project:
//   username + password (Argon2id), optional/required TOTP authenticator code, scoped short-lived tokens,
//   lockout with "attempts remaining", uniform errors, token revocation and a tamper-evident audit log.
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const AuditLog = require('../models/AuditLog');
const { signToken } = require('../utils/token');
const { passwordProblem } = require('../utils/passwordPolicy');
const { hashPassword, verifyPassword, needsRehash, burnVerify } = require('../utils/password');
const totp = require('../utils/totp');
const ghosts = require('../utils/attempts');
const audit = require('../utils/audit');

const { MAX, LOCK_MIN } = ghosts;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

const isStr = (v, max = 254) => typeof v === 'string' && v.length > 0 && v.length <= max;
const normUsername = (v) => v.trim().toLowerCase();
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const bad = (res, message = 'Invalid request') => res.status(400).json({ success: false, message });
const server = (res, label, error) => { console.error(`${label}:`, error); res.status(500).json({ success: false, message: 'Server error' }); };

const invalid = (res, remaining, what = 'credentials') =>
  res.status(401).json({ success: false, message: `Invalid ${what}. ${plural(Math.max(remaining, 0), 'attempt')} remaining before the account is locked.` });
const locked = (res, minutes) =>
  res.status(429).set('Retry-After', String(minutes * 60)).json({ success: false, message: `Too many failed attempts. Try again in ${plural(minutes, 'minute')}.` });

const publicUser = (u) => ({
  _id: u._id, username: u.username, name: u.name, role: u.role, phone: u.phone, avatar: u.avatar,
  restaurantId: u.restaurantId, mfaEnabled: !!u.mfaEnabled,
});

// ------------------------------------------------------------------ lockout helpers (atomic, race-free)
/** Uses up one attempt BEFORE the secret is checked, so parallel guesses cannot exceed the limit. */
const claimAttempt = async (user) => {
  const now = new Date();
  await User.updateOne({ _id: user._id, lockoutUntil: { $lte: now } }, { $set: { failedAttempts: 0 }, $unset: { lockoutUntil: 1 } });
  // One atomic step: add 1 to the counter and read the new value (native driver: returns the updated document).
  const doc = await User.collection.findOneAndUpdate({ _id: user._id }, { $inc: { failedAttempts: 1 } }, { returnDocument: 'after' });
  if (doc.lockoutUntil && doc.lockoutUntil > now) return { locked: true, minutes: Math.max(1, Math.ceil((doc.lockoutUntil - now) / 60000)) };
  if (doc.failedAttempts > MAX) { await lockNow(user); return { locked: true, minutes: LOCK_MIN }; }
  return { locked: false, n: doc.failedAttempts };
};
const lockNow = (user) => User.updateOne({ _id: user._id }, { $set: { failedAttempts: 0, lockoutUntil: new Date(Date.now() + LOCK_MIN * 60000) } });
const clearAttempts = (user) => User.updateOne({ _id: user._id }, { $set: { failedAttempts: 0 }, $unset: { lockoutUntil: 1 } });

/** A wrong secret for a real account: answer with attempts remaining, or lock it. */
const failReal = async (res, req, user, claim, reason, what) => {
  await audit.record('login.failure', { req, actor: user, success: false, detail: { reason } });
  if (claim.n >= MAX) {
    await lockNow(user);
    await audit.record('account.locked', { req, actor: user, success: false, detail: { minutes: LOCK_MIN } });
    return locked(res, LOCK_MIN);
  }
  return invalid(res, MAX - claim.n, what);
};

/** Unknown or disabled username: same work, same counter, same messages as a real account. */
const failGhost = async (res, req, name, user, password, what) => {
  await burnVerify(password || '');
  const key = name.slice(0, 64);
  const minutes = ghosts.lockedMinutes(key);
  if (minutes) {
    await audit.record('login.failure', { req, actor: user || undefined, actorName: name, success: false, detail: { reason: 'locked' } });
    return locked(res, minutes);
  }
  const { count, locked: nowLocked } = ghosts.fail(key);
  await audit.record('login.failure', { req, actor: user || undefined, actorName: name, success: false, detail: { reason: user ? 'disabled' : 'unknown_user' } });
  if (nowLocked) return locked(res, LOCK_MIN);
  return invalid(res, MAX - count, what);
};

// ------------------------------------------------------------------ register
exports.register = async (req, res) => {
  try {
    const { username, name, password, phone, role, restaurantName } = req.body || {};
    if (!isStr(username, 32) || !USERNAME_RE.test(username)) return bad(res, 'Username must be 3 to 32 characters: letters, numbers, dot, dash or underscore');
    if (!isStr(name, 100)) return bad(res, 'Name is required');
    if (!isStr(password, 128)) return bad(res, 'Password is required');
    if (role !== undefined && !['user', 'restaurant'].includes(role)) return bad(res, 'Invalid role');
    if (phone !== undefined && !(typeof phone === 'string' && phone.length <= 20)) return bad(res, 'Invalid phone number');
    if (restaurantName !== undefined && !(typeof restaurantName === 'string' && restaurantName.length <= 100)) return bad(res, 'Invalid restaurant name');

    const cleanName = normUsername(username);
    const problem = passwordProblem(password, cleanName);
    if (problem) return bad(res, problem);
    if (await User.exists({ username: cleanName })) return res.status(409).json({ success: false, message: 'That username is already taken' });

    const user = await new User({
      username: cleanName, name: name.trim(), password: await hashPassword(password), role: role || 'user', phone: phone || '',
    }).save();

    if (user.role === 'restaurant') {
      const restaurant = await new Restaurant({ owner: user._id, name: restaurantName || `${name.trim()}'s Restaurant`, phone: phone || '' }).save();
      user.restaurantId = restaurant._id;
      await user.save();
    }
    await audit.record('user.register', { req, actor: user, detail: { role: user.role } });
    res.status(201).json({ success: true, message: 'Account created. You can sign in now.' });
  } catch (error) {
    if (error && error.code === 11000) return res.status(409).json({ success: false, message: 'That username is already taken' });
    server(res, 'Register error', error);
  }
};

// ------------------------------------------------------------------ login
exports.login = async (req, res) => {
  try {
    const { username, password, totpCode, role } = req.body || {};
    if (!isStr(username, 64) || !isStr(password, 128) || (totpCode !== undefined && typeof totpCode !== 'string') || (role !== undefined && typeof role !== 'string')) {
      return bad(res, 'Please provide your username and password');
    }
    const name = normUsername(username);
    const user = await User.findOne({ username: name }).select('+password +totpSecret');
    if (!user || !user.isActive) return failGhost(res, req, name, user, password);

    const claim = await claimAttempt(user);
    if (claim.locked) {
      await burnVerify(password);
      await audit.record('login.failure', { req, actor: user, success: false, detail: { reason: 'locked' } });
      return locked(res, claim.minutes);
    }

    if (!(await verifyPassword(password, user.password))) return failReal(res, req, user, claim, 'wrong_password');

    if (role && user.role !== role) {       // only reached with the right password, so this reveals nothing to a stranger
      await clearAttempts(user);
      return res.status(401).json({ success: false, message: 'This account does not match the selected account type' });
    }
    if (user.mfaEnabled && !totp.check(user.totpSecret, totpCode)) {
      return failReal(res, req, user, claim, totpCode ? 'mfa_invalid' : 'mfa_missing');
    }

    await clearAttempts(user);
    const update = { lastLoginAt: new Date() };
    if (needsRehash(user.password)) update.password = await hashPassword(password);     // bcrypt -> Argon2id upgrade
    await User.updateOne({ _id: user._id }, { $set: update });

    // Restaurant owners must use two-step sign-in. Until it is set up they only get a limited token.
    const scope = user.role === 'restaurant' && !user.mfaEnabled ? 'mfa_setup' : 'full';
    await audit.record('login.success', { req, actor: user, detail: { scope } });
    res.json({ success: true, token: signToken(user, scope), scope, mfaSetupRequired: scope === 'mfa_setup', user: publicUser(user) });
  } catch (error) {
    server(res, 'Login error', error);
  }
};

// ------------------------------------------------------------------ session
exports.getMe = (req, res) => {
  res.json({
    success: true,
    user: { ...publicUser(req.user), address: req.user.address },
    scope: req.tokenScope,
    mfaRequired: req.user.role === 'restaurant',
    sessionExpiresAt: new Date(req.tokenExp * 1000).toISOString(),
  });
};

// Revokes every token issued so far for this user.
exports.logout = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    await audit.record('logout', { req, actor: req.user });
    res.json({ success: true, message: 'Signed out' });
  } catch (error) {
    server(res, 'Logout error', error);
  }
};

// ------------------------------------------------------------------ two-step sign-in (TOTP)
exports.mfaSetup = async (req, res) => {
  try {
    if (req.user.mfaEnabled) return bad(res, 'Two-step sign-in is already on');
    const secret = totp.newSecret();
    await User.updateOne({ _id: req.user._id }, { $set: { totpSecret: secret } });     // pending until /enable proves it
    const otpauthUri = totp.uri(secret, req.user.username);
    await audit.record('mfa.setup_started', { req, actor: req.user });
    res.json({ success: true, secret, otpauthUri, qr: await totp.qr(otpauthUri) });
  } catch (error) {
    server(res, 'MFA setup error', error);
  }
};

exports.mfaEnable = async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!isStr(code, 10)) return bad(res, 'Enter the 6-digit code from your authenticator app');
    const user = await User.findById(req.user._id).select('+totpSecret');
    if (user.mfaEnabled) return bad(res, 'Two-step sign-in is already on');
    if (!user.totpSecret) return bad(res, 'Start the setup first');

    const claim = await claimAttempt(user);
    if (claim.locked) return locked(res, claim.minutes);
    if (!totp.check(user.totpSecret, code)) {
      await audit.record('mfa.enable_failed', { req, actor: user, success: false });
      if (claim.n >= MAX) { await lockNow(user); return locked(res, LOCK_MIN); }
      return res.status(400).json({ success: false, message: `That code is not right. Check your authenticator app. ${plural(MAX - claim.n, 'attempt')} left.` });
    }
    await clearAttempts(user);
    user.mfaEnabled = true;
    user.tokenVersion += 1;                                    // the limited token stops working; a full one is issued below
    await User.updateOne({ _id: user._id }, { $set: { mfaEnabled: true }, $inc: { tokenVersion: 1 } });
    await audit.record('mfa.enabled', { req, actor: user });
    res.json({ success: true, token: signToken(user, 'full'), scope: 'full', user: publicUser(user) });
  } catch (error) {
    server(res, 'MFA enable error', error);
  }
};

exports.mfaDisable = async (req, res) => {
  try {
    if (req.user.role === 'restaurant') return res.status(403).json({ success: false, message: 'Restaurant accounts must keep two-step sign-in on' });
    const { password, code } = req.body || {};
    if (!isStr(password, 128) || !isStr(code, 10)) return bad(res, 'Enter your password and a code from your authenticator app');
    const user = await User.findById(req.user._id).select('+password +totpSecret');
    if (!user.mfaEnabled) return bad(res, 'Two-step sign-in is not on');

    const claim = await claimAttempt(user);
    if (claim.locked) return locked(res, claim.minutes);
    if (!(await verifyPassword(password, user.password)) || !totp.check(user.totpSecret, code)) {
      await audit.record('mfa.disable_failed', { req, actor: user, success: false });
      if (claim.n >= MAX) { await lockNow(user); return locked(res, LOCK_MIN); }
      return invalid(res, MAX - claim.n, 'password or code');
    }
    await clearAttempts(user);
    await User.updateOne({ _id: user._id }, { $set: { mfaEnabled: false }, $unset: { totpSecret: 1 }, $inc: { tokenVersion: 1 } });
    user.tokenVersion += 1;
    await audit.record('mfa.disabled', { req, actor: user });
    res.json({ success: true, token: signToken(user, 'full'), message: 'Two-step sign-in turned off' });
  } catch (error) {
    server(res, 'MFA disable error', error);
  }
};

// ------------------------------------------------------------------ passwords
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!isStr(currentPassword, 128) || !isStr(newPassword, 128)) return bad(res, 'Enter your current and your new password');
    const problem = passwordProblem(newPassword, req.user.username);
    if (problem) return bad(res, problem);

    const user = await User.findById(req.user._id).select('+password');
    const claim = await claimAttempt(user);
    if (claim.locked) return locked(res, claim.minutes);
    if (!(await verifyPassword(currentPassword, user.password))) {
      await audit.record('password.change_failed', { req, actor: user, success: false });
      if (claim.n >= MAX) { await lockNow(user); return locked(res, LOCK_MIN); }
      return invalid(res, MAX - claim.n, 'current password');
    }
    await clearAttempts(user);
    await User.updateOne({ _id: user._id }, { $set: { password: await hashPassword(newPassword) }, $inc: { tokenVersion: 1 } });
    user.tokenVersion += 1;                                   // every other session is signed out
    await audit.record('password.change', { req, actor: user });
    res.json({ success: true, token: signToken(user, 'full'), message: 'Password changed' });
  } catch (error) {
    server(res, 'Change password error', error);
  }
};

// Forgot your password? Without e-mail, the authenticator app is the proof of identity.
// Accounts without two-step sign-in cannot recover this way (the answer looks the same as for any wrong code).
exports.recover = async (req, res) => {
  try {
    const { username, code, newPassword } = req.body || {};
    if (!isStr(username, 64) || !isStr(code, 10) || !isStr(newPassword, 128)) return bad(res, 'Enter your username, an authenticator code and a new password');
    const name = normUsername(username);
    if (!/^\d{6}$/.test(code.replace(/\s/g, ''))) return bad(res, 'The code is the 6 digits shown in your authenticator app');
    const problem = passwordProblem(newPassword, name);
    if (problem) return bad(res, problem);

    const user = await User.findOne({ username: name }).select('+totpSecret');
    if (!user || !user.isActive) return failGhost(res, req, name, user, newPassword, 'username or code');

    const claim = await claimAttempt(user);
    if (claim.locked) return locked(res, claim.minutes);
    if (!user.mfaEnabled || !totp.check(user.totpSecret, code)) return failReal(res, req, user, claim, 'recover_invalid', 'username or code');

    await clearAttempts(user);
    await User.updateOne({ _id: user._id }, { $set: { password: await hashPassword(newPassword) }, $inc: { tokenVersion: 1 } });
    await audit.record('password.reset_with_mfa', { req, actor: user });
    res.json({ success: true, message: 'Password changed. You can sign in now.' });
  } catch (error) {
    server(res, 'Recover error', error);
  }
};

// ------------------------------------------------------------------ own security activity
exports.activity = async (req, res) => {
  try {
    const rows = await AuditLog.find({ actorId: String(req.user._id) }).sort({ seq: -1 }).limit(20).lean();
    res.json({
      success: true,
      items: rows.map((r) => ({ id: r.seq, timestamp: r.ts, action: r.action, ip: r.ip, success: r.success, detail: r.detail })),
    });
  } catch (error) {
    server(res, 'Activity error', error);
  }
};
