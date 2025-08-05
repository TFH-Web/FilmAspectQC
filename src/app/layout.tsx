import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Church Media QC Tool',
  description: 'Quality control tool for church stage display media',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} dark bg-gray-950 text-white`}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
          {children}
        </div>
      </body>
    </html>
  );
}
