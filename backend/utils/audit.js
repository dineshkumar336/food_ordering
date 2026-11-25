// Tamper-evident audit log (hash chain), same idea as the IAM project.
const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

const GENESIS = '0'.repeat(64);
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const digest = (e) => sha256(JSON.stringify([
  e.prevHash, e.seq, new Date(e.ts).toISOString(), e.actorId || null, e.actorName || null,
  e.action, e.target || null, e.ip || null, e.userAgent || null, !!e.success, e.detail || '',
]));

let queue = Promise.resolve();      // writes are done one after another inside this process

const write = async (fields) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await AuditLog.findOne().sort({ seq: -1 }).lean();
    const entry = { ...fields, seq: last ? last.seq + 1 : 1, ts: new Date(), prevHash: last ? last.hash : GENESIS };
    entry.hash = digest(entry);
    try { return await AuditLog.create(entry); }
    catch (err) { if (!(err && err.code === 11000)) throw err; }     // another process took this seq: retry
  }
  throw new Error('audit log busy');
};

/** record('login.failure', { req, actor, actorName, target, success, detail }) - never throws. */
const record = (action, { req, actor, actorName, target, success = true, detail } = {}) => {
  const fields = {
    action,
    actorId: actor ? String(actor._id) : undefined,
    actorName: (actor ? actor.username : actorName || undefined)?.toString().slice(0, 64),
    target: target ? String(target).slice(0, 64) : undefined,
    ip: req ? req.ip : undefined,
    userAgent: req ? String(req.headers['user-agent'] || '').slice(0, 200) : undefined,
    success,
    detail: detail ? JSON.stringify(detail) : '',
  };
  const job = queue.then(() => write(fields));
  queue = job.catch(() => {});
  return job.catch((err) => console.error('Audit log error:', err.message));
};

const verifyChain = async () => {
  let prev = GENESIS, checked = 0;
  const cursor = AuditLog.find().sort({ seq: 1 }).lean().cursor();
  for await (const e of cursor) {
    checked += 1;
    if (e.prevHash !== prev) return { valid: false, checked, brokenAt: e.seq, head: prev, reason: 'Chain broken: an entry was deleted or reordered' };
    if (digest(e) !== e.hash) return { valid: false, checked, brokenAt: e.seq, head: prev, reason: 'Entry content was changed after it was written' };
    prev = e.hash;
  }
  return { valid: true, checked, brokenAt: null, head: prev, reason: null };
};

module.exports = { record, verifyChain };
