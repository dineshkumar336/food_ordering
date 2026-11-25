// TOTP authenticator codes (Google Authenticator, Microsoft Authenticator, Authy ...) with a QR code for enrolment.
const { authenticator } = require('otplib');
const QRCode = require('qrcode');

authenticator.options = { window: 1 };      // accept the code before/after the current 30 s step (clock drift)

// 20 bytes = 160 bits, as recommended by RFC 4226 (the library default is only 80 bits)
const newSecret = () => authenticator.generateSecret(20);

const check = (secret, code) => {
  if (!secret || typeof code !== 'string') return false;
  const clean = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(clean)) return false;
  try { return authenticator.check(clean, secret); } catch (_) { return false; }
};

const uri = (secret, username) => authenticator.keyuri(username, process.env.TOTP_ISSUER || 'Food Ordering', secret);
const qr = (otpauthUri) => QRCode.toDataURL(otpauthUri, { margin: 1, width: 240 });

module.exports = { newSecret, check, uri, qr };
