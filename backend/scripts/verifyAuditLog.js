// Checks the audit log's hash chain:   node scripts/verifyAuditLog.js
const mongoose = require('mongoose');
require('dotenv').config();
const { verifyChain } = require('../utils/audit');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const r = await verifyChain();
  console.log(r.valid ? `Log is intact: ${r.checked} entries verified (head ${r.head.slice(0, 16)}...)` : `TAMPERING DETECTED at entry #${r.brokenAt}: ${r.reason}`);
  await mongoose.disconnect();
  process.exit(r.valid ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
