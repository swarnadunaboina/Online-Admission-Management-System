import type { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">AdmissionsHub</span>
        </Link>

        {/* Central content */}
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Your Academic Future <br />
            Starts Here
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed max-w-md">
            Apply online, track your application, submit documents, and pay fees — all from one powerful digital portal.
          </p>

          {/* Feature bullets */}
          <ul className="mt-8 space-y-3">
            {[
              'Apply to multiple programs easily',
              'Upload documents securely',
              'Real-time application status',
              'Online fee payment',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/90 text-sm">
                <span className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <p className="text-white/90 text-sm italic leading-relaxed">
            &ldquo;The admission process was incredibly smooth. I submitted everything online and got my acceptance within days!&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>
            <div>
              <div className="text-white text-sm font-medium">Priya Sharma</div>
              <div className="text-primary-200 text-xs">B.Tech Student, 2024</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo */}
        <div className="lg:hidden p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">AdmissionsHub</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
