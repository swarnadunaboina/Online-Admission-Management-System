import Link from 'next/link';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-primary-600 rounded-lg">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                Admission<span className="text-primary-400">Pro</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              A digital platform that helps educational institutions manage the student
              enrollment process effortlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {['Programs', 'How to Apply', 'Eligibility Criteria', 'Fee Structure', 'FAQs'].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Student Portal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Student Portal
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Apply Online', href: '/register' },
                { label: 'Check Status', href: '/student/applications' },
                { label: 'Upload Documents', href: '/student/documents' },
                { label: 'Pay Fees', href: '/student/payment' },
                { label: 'Submit Inquiry', href: '/student/inquiries' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gray-500" />
                Admission Office, Main Campus
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone size={16} className="shrink-0 text-gray-500" />
                +1 (555) 000-0000
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail size={16} className="shrink-0 text-gray-500" />
                admissions@institution.edu
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} AdmissionPro. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
