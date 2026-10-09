import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fb_exporter';
const ADMIN_EMAIL = (process.env.ADMIN_INITIAL_EMAIL || 'admin@fbexporter.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || 'admin123456';

function generateLicenseKey() {
  const segment1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `FBX-${segment1}-${segment2}-${segment3}`;
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended', 'expired'], default: 'active' },
    licenseKey: { type: String, required: true, unique: true },
    subscriptionExpiresAt: { type: Date, required: true },
    price: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  console.log(`Connecting to MongoDB Atlas...`);
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected successfully!`);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const tenYearsExpiry = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);

  if (existing) {
    existing.role = 'admin';
    existing.status = 'active';
    existing.password = hashedPassword;
    existing.subscriptionExpiresAt = tenYearsExpiry;
    await existing.save();
    console.log(`\n========================================`);
    console.log(`Admin account already existed and was UPDATED:`);
    console.log(`Email:    ${existing.email}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Role:     ${existing.role}`);
    console.log(`Status:   ${existing.status}`);
    console.log(`License:  ${existing.licenseKey}`);
    console.log(`========================================\n`);
  } else {
    const adminUser = await User.create({
      name: 'Super Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      licenseKey: generateLicenseKey(),
      subscriptionExpiresAt: tenYearsExpiry,
      price: 'Master Account',
      notes: 'Initial administrator created via seed script',
    });
    console.log(`\n========================================`);
    console.log(`Admin account CREATED successfully in MongoDB:`);
    console.log(`Email:    ${adminUser.email}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Role:     ${adminUser.role}`);
    console.log(`Status:   ${adminUser.status}`);
    console.log(`License:  ${adminUser.licenseKey}`);
    console.log(`========================================\n`);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

main().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
