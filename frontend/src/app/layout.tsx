import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    template: '%s | AdmissionPro',
    default: 'AdmissionPro - Online Admission Management System',
  },
  description:
    'A digital platform for managing student admissions, applications, eligibility checks, document submissions, and fee payments.',
  keywords: ['admission management', 'student enrollment', 'online admission', 'education'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
            success: { style: { background: '#059669' } },
            error: { style: { background: '#dc2626' } },
          }}
        />
      </body>
    </html>
  );
}
