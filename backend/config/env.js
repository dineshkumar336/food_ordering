// Fail fast on missing or weak configuration instead of running insecurely.
const required = ['MONGODB_URI', 'JWT_SECRET'];

const checkEnv = () => {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 32 || /^your_|change.?me/i.test(process.env.JWT_SECRET)) {
    console.error('JWT_SECRET must be at least 32 characters and not a placeholder. Generate one with:\n  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
    process.exit(1);
  }
};

module.exports = checkEnv;
