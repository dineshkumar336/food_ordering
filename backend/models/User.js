const mongoose = require('mongoose');

// Sign-in works like the IAM project: username + password (+ authenticator code). No e-mail is needed.
const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    minlength: 3, maxlength: 32, match: /^[a-z0-9_.-]+$/,
  },
  name: { type: String, required: true, trim: true },
  password: { type: String, required: true, select: false },        // Argon2id hash
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'restaurant'], required: true },
  avatar: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  },
  // Restaurant specific
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },

  isActive: { type: Boolean, default: true },
  // Two-step sign-in (TOTP). The secret stays "pending" until a valid code proves the user has it.
  mfaEnabled: { type: Boolean, default: false },
  totpSecret: { type: String, select: false },
  // Lockout counters and token revocation
  failedAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date },
  tokenVersion: { type: Number, default: 0 },
  lastLoginAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
