import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Family Routine Assistant - Guardian Dashboard',
  description: 'Manage your family\'s routines and tasks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
