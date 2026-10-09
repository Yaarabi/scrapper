import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'user';
      status: 'active' | 'suspended' | 'expired';
      licenseKey: string;
      subscriptionExpiresAt: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'admin' | 'user';
    status: 'active' | 'suspended' | 'expired';
    licenseKey: string;
    subscriptionExpiresAt: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'user';
    status: 'active' | 'suspended' | 'expired';
    licenseKey: string;
    subscriptionExpiresAt: string;
  }
}
