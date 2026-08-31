require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const Admin = require('./src/models/Admin');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne();
    if (existing) {
      console.log('An admin account already exists. Skipping creation.');
      console.log('Admin username:', existing.username);
      await mongoose.disconnect();
      process.exit(0);
    }

    const username = 'admin';
    const password = crypto.randomBytes(6).toString('base64url').slice(0, 12);

    const admin = await Admin.create({ username, password });

    console.log('==========================================');
    console.log('  ADMIN ACCOUNT CREATED SUCCESSFULLY');
    console.log('==========================================');
    console.log('  Username:', admin.username);
    console.log('  Password:', password);
    console.log('==========================================');
    console.log('  Save these credentials somewhere safe.');
    console.log('  They will NOT be shown again.');
    console.log('==========================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed admin error:', error);
    process.exit(1);
  }
}

seedAdmin();