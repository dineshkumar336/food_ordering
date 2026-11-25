// Argon2id password hashing (same algorithm as the IAM project).
const argon2 = require('argon2');
const bcrypt = require('bcryptjs');

const hashPassword = (password) => argon2.hash(password, { type: argon2.argon2id });

// Existing accounts still have bcrypt hashes. They keep working, and are upgraded to Argon2id on the next login.
const verifyPassword = async (password, hash) => {
  if (typeof hash !== 'string') return false;
  try {
    if (hash.startsWith('$argon2')) return await argon2.verify(hash, password);
    if (/^\$2[aby]\$/.test(hash)) return await bcrypt.compare(password, hash);
  } catch (_) { /* malformed hash */ }
  return false;
};

const needsRehash = (hash) => !hash.startsWith('$argon2') || argon2.needsRehash(hash);

// Same amount of work for unknown usernames, so timing does not reveal which accounts exist.
let dummy;
const burnVerify = async (password) => {
  dummy = dummy || hashPassword('dummy-password-used-to-equalise-timing');
  await verifyPassword(password, await dummy);
};

module.exports = { hashPassword, verifyPassword, needsRehash, burnVerify };
