import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://streakcalendar.com'),
  title: 'Streak Calendar',
  description: 'Track your habits and improve your life',
  keywords: ['habit tracking', 'streak calendar', 'productivity'],
  openGraph: {
    title: 'Streak Calendar',
    description: 'Track your habits and improve your life',
    images: ['/og-image.png'],
    type: 'website',
    siteName: 'Streak Calendar',
    url: 'https://streakcalendar.com',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
