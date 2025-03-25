import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OBR Forecast Household Calculator',
  description: 'Calculate how OBR forecasts affect your household net income for 2030',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/blue.svg" />
        <script defer data-domain="obr-forecast-household-calculator-578039519715.us-central1.run.app" src="https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }` }}></script>
      </head>
      <body className={`${inter.className} bg-gray-50`}>{children}</body>
    </html>
  );
}
