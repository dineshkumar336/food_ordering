// Server-side password rules (fix #12). The frontend shows the same rules, but only this check counts.
const COMMON = new Set([
  '12345678', '123456789', '1234567890', '11111111', '00000000', '87654321', 'qwerty123', 'qwertyuiop',
  'abc12345', 'abcd1234', 'iloveyou1', 'welcome1', 'welcome123', 'admin123', 'admin1234', 'letmein1',
  'letmein123', 'monkey123', 'dragon123', 'football1', 'changeme1', 'changeme123', 'passw0rd', 'p@ssw0rd',
  'sunshine1', 'princess1', 'whatever1', 'zaq12wsx', '1q2w3e4r', '1qaz2wsx',
]);

/** Returns a message describing the first problem, or null if the password is acceptable. */
const passwordProblem = (password, email = '') => {
  if (typeof password !== 'string' || password.length === 0) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password must be at most 128 characters';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Password must contain at least one letter and one number';
  const low = password.toLowerCase();
  if (COMMON.has(low) || low.includes('password') || new Set(low).size < 4) return 'That password is too common or too easy to guess';
  const local = String(email).split('@')[0].toLowerCase();
  if (local.length >= 4 && low.includes(local)) return 'Password must not contain your email name';
  return null;
};

module.exports = { passwordProblem };
