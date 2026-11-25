// "N attempts remaining" must not reveal which usernames exist. So usernames that do not exist (or are disabled)
// get the same counter and lockout as real accounts, and every username produces identical messages.
const MAX = Number(process.env.MAX_FAILED_ATTEMPTS || 5);
const LOCK_MIN = Number(process.env.LOCKOUT_MINUTES || 15);
const MAX_TRACKED = 10000;

const entries = new Map();     // username -> { count, until }

const lockedMinutes = (name) => {
  const e = entries.get(name);
  if (!e) return 0;
  const now = Date.now();
  if (e.until > now) return Math.max(1, Math.ceil((e.until - now) / 60000));
  if (e.until) entries.delete(name);     // lock expired
  return 0;
};

/** Records a failure. Returns { count, locked }. */
const fail = (name) => {
  const now = Date.now();
  if (entries.size >= MAX_TRACKED) {
    for (const [k, v] of entries) if (v.until <= now && v.count === 0) entries.delete(k);
    if (entries.size >= MAX_TRACKED * 2) return { count: 1, locked: false };   // flood protection: stop growing
  }
  const e = entries.get(name) || { count: 0, until: 0 };
  e.count += 1;
  entries.set(name, e);
  if (e.count >= MAX) {
    e.count = 0;
    e.until = now + LOCK_MIN * 60000;
    return { count: MAX, locked: true };
  }
  return { count: e.count, locked: false };
};

const clear = () => entries.clear();

module.exports = { MAX, LOCK_MIN, lockedMinutes, fail, clear };
