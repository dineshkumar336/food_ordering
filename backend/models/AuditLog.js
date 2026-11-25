const mongoose = require('mongoose');

// Tamper-evident security log: every row stores the SHA-256 of its own content plus the hash of the previous row.
const auditLogSchema = new mongoose.Schema({
  seq: { type: Number, required: true, unique: true },     // strict order of the chain
  ts: { type: Date, required: true },
  actorId: { type: String, index: true },                  // string, not a reference: history outlives users
  actorName: String,
  action: { type: String, required: true, index: true },
  target: String,
  ip: String,
  userAgent: String,
  success: { type: Boolean, default: true },
  detail: { type: String, default: '' },
  prevHash: { type: String, required: true },
  hash: { type: String, required: true },
}, { versionKey: false });

module.exports = mongoose.model('AuditLog', auditLogSchema);
