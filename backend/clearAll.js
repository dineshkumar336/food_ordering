const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

const clearAllData = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // 2. Delete all records from collections
    console.log('Deleting database records...');
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      MenuItem.deleteMany({}),
      Order.deleteMany({})
    ]);
    console.log('✅ All database records deleted.');

    // 3. Clear uploads directory
    const uploadDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadDir)) {
      console.log('Clearing uploads directory...');
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        if (file !== '.gitkeep') { // Keep .gitkeep if it exists
          fs.unlinkSync(path.join(uploadDir, file));
        }
      }
      console.log('✅ Uploads directory cleared.');
    }

    console.log('\n✨ Entire data has been wiped. You can now start fresh!');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

clearAllData();
