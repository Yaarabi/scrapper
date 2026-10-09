import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'FB Group Member Exporter Pro | High-Performance Lead Extraction',
  description:
    'Extract Facebook group members with numeric IDs, usernames, and profile links directly in your browser. Excel & CSV ready.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="glow-background">
          <div className="glow-orb-1" />
          <div className="glow-orb-2" />
          <div className="glow-orb-3" />
        </div>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
