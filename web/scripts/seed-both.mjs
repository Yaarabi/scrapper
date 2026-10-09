import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fb_exporter';

const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String,
  status: String, licenseKey: String, subscriptionExpiresAt: Date,
  price: String, notes: String
}, { timestamps: true });

async function seedBoth() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to:', mongoose.connection.name);

  const hash = await bcrypt.hash('admin123456', 10);
  const tenYears = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);

  // 1. Seed into fb_exporter
  const fbDb = mongoose.connection.useDb('fb_exporter');
  const FbUser = fbDb.model('User', UserSchema);
  await FbUser.updateOne(
    { email: 'admin@fbexporter.com' },
    {
      name: 'Super Admin',
      email: 'admin@fbexporter.com',
      password: hash,
      role: 'admin',
      status: 'active',
      licenseKey: 'FBX-E446-DA3F-8F70',
      subscriptionExpiresAt: tenYears,
      price: 'Master Account',
      notes: 'Initial administrator'
    },
    { upsert: true }
  );
  console.log('Admin verified in fb_exporter database!');

  // 2. Seed into test db as well
  const testDb = mongoose.connection.useDb('test');
  const TestUser = testDb.model('User', UserSchema);
  await TestUser.updateOne(
    { email: 'admin@fbexporter.com' },
    {
      name: 'Super Admin',
      email: 'admin@fbexporter.com',
      password: hash,
      role: 'admin',
      status: 'active',
      licenseKey: 'FBX-E446-DA3F-8F70',
      subscriptionExpiresAt: tenYears,
      price: 'Master Account',
      notes: 'Initial administrator'
    },
    { upsert: true }
  );
  console.log('Admin verified in test database!');

  await mongoose.disconnect();
}

seedBoth().catch(console.error);
