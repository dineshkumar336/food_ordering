// One-time migration for databases created before the IAM-style sign-in.
//   node scripts/migrate-to-username.js
// - gives every user a unique username (made from the old e-mail name)
// - removes the old e-mail verification / reset fields and the unique e-mail index
// - old bcrypt passwords keep working and are upgraded to Argon2id at the next login
// - restaurant owners will be asked to set up two-step sign-in at their next login
const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = mongoose.connection.collection('users');

  const taken = new Set((await users.find({ username: { $exists: true } }, { projection: { username: 1 } }).toArray()).map((u) => u.username));
  const rows = [];
  for (const u of await users.find({ username: { $exists: false } }).toArray()) {
    let base = String(u.email || u.name || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 28);
    if (base.length < 3) base = (base + 'user').slice(0, 28);
    let name = base, i = 1;
    while (taken.has(name)) name = `${base}${++i}`;
    taken.add(name);
    await users.updateOne({ _id: u._id }, {
      $set: { username: name, mfaEnabled: false, failedAttempts: 0, tokenVersion: (u.tokenVersion || 0) + 1 },
      $unset: { isVerified: 1, verifyEmailOtp: 1, verifyEmailOtpExpire: 1, verifyEmailAttempts: 1, resetPasswordToken: 1, resetPasswordExpire: 1 },
    });
    rows.push({ role: u.role, oldEmail: u.email, username: name });
  }

  try { await users.dropIndex('email_1'); console.log('Dropped the old unique e-mail index'); } catch (_) { /* not there */ }
  await users.createIndex({ username: 1 }, { unique: true });

  console.table(rows);
  console.log(`${rows.length} user(s) migrated. Tell them their new username (the table above).`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
