import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getRemainingDays } from '@/lib/utils';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { licenseKey } = body;

    if (!licenseKey || typeof licenseKey !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'License key is required.' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    await connectDB();

    const user = await User.findOne({
      licenseKey: licenseKey.trim().toUpperCase(),
    });

    if (!user) {
      return NextResponse.json(
        { valid: false, message: 'Invalid license key. Check your key or contact support.' },
        {
          status: 404,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { valid: false, message: 'Your account has been suspended by the administrator.' },
        {
          status: 403,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const { days, isExpired } = getRemainingDays(user.subscriptionExpiresAt);

    if (isExpired) {
      if (user.status === 'active') {
        user.status = 'expired';
        await user.save();
      }

      return NextResponse.json(
        {
          valid: false,
          message: `Your subscription expired on ${new Date(user.subscriptionExpiresAt).toLocaleDateString()}. Please contact the administrator to renew.`,
          expiresAt: user.subscriptionExpiresAt,
        },
        {
          status: 403,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        name: user.name,
        expiresAt: user.subscriptionExpiresAt,
        daysRemaining: days,
        role: user.role,
        message: 'License is active and valid.',
      },
      {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error) {
    console.error('License verification error:', error);
    return NextResponse.json(
      { valid: false, message: 'Internal server error verifying license.' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
