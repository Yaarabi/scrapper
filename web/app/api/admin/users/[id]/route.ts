import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateLicenseKey } from '@/lib/utils';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, addDays, customExpiresAt, status, newPassword, price, notes } = body;

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle different actions
    if (action === 'extend') {
      let currentExpiry = new Date(user.subscriptionExpiresAt);
      // If already expired, extend from today
      if (currentExpiry < new Date()) {
        currentExpiry = new Date();
      }

      if (customExpiresAt) {
        user.subscriptionExpiresAt = new Date(customExpiresAt);
      } else if (addDays) {
        const days = parseInt(addDays, 10);
        user.subscriptionExpiresAt = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
      }

      // Automatically reactivate if extended
      user.status = 'active';
    } else if (action === 'toggle-status') {
      if (status) {
        user.status = status;
      } else {
        user.status = user.status === 'active' ? 'suspended' : 'active';
      }
    } else if (action === 'regenerate-key') {
      user.licenseKey = generateLicenseKey();
    } else if (action === 'update-password' && newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    } else if (action === 'update-info') {
      if (price !== undefined) user.price = price;
      if (notes !== undefined) user.notes = notes;
    }

    await user.save();

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        licenseKey: user.licenseKey,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        price: user.price,
        notes: user.notes,
      },
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own admin account.' }, { status: 400 });
    }

    await connectDB();

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
