import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateLicenseKey } from '@/lib/utils';

export async function GET() {
  try {
    await connectDB();

    const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || 'admin@fbexporter.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123456';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin account already exists.',
        email: existingAdmin.email,
        role: existingAdmin.role,
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    // Lifetime admin expiration (10 years)
    const tenYearsExpiry = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);

    const admin = await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      licenseKey: generateLicenseKey(),
      subscriptionExpiresAt: tenYearsExpiry,
      price: 'Admin Account',
      notes: 'Initial master administrator',
    });

    return NextResponse.json({
      message: 'Admin account created successfully.',
      email: admin.email,
      initialPassword: adminPassword,
      role: admin.role,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message || 'Failed to seed admin' }, { status: 500 });
  }
}
