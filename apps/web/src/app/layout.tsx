import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/QueryProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'EduFlow',
  description: 'Document Workflow Platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
