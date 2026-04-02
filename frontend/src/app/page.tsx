'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  GraduationCap,
  FileText,
  CheckCircle,
  Clock,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Star,
  Users,
  BookOpen,
  Award,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {Footer} from '@/components/layout/Footer';
import { api } from '@/lib/api';
import type { Program } from '@/types';

const features = [
  {
    icon: FileText,
    title: 'Online Applications',
    description:
      'Apply to your desired programs completely online. Fill in personal details, academic background, and submit with ease.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: CheckCircle,
    title: 'Eligibility Checks',
    description:
      'Get instant eligibility verification based on your academic credentials and program requirements.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Clock,
    title: 'Real-Time Status',
    description:
      'Track your application status in real time — from submission through review to final decision.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: FileText,
    title: 'Document Upload',
    description:
      'Securely upload required documents like transcripts, ID proofs, and certificates directly on the portal.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: CreditCard,
    title: 'Online Fee Payment',
    description:
      'Pay application and tuition fees conveniently through our secure online payment gateway.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: MessageSquare,
    title: 'Inquiry Support',
    description:
      'Submit questions and receive responses from the admissions team directly within the portal.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
];

const stats = [
  { value: '10,000+', label: 'Students Enrolled', icon: Users },
  { value: '50+', label: 'Programs Offered', icon: BookOpen },
  { value: '95%', label: 'Acceptance Rate', icon: Award },
  { value: '4.8/5', label: 'Student Satisfaction', icon: Star },
];

const steps = [
  { step: '01', title: 'Create an Account', description: 'Register with your email to get started on the student portal.' },
  { step: '02', title: 'Browse Programs', description: 'Explore available programs and check eligibility criteria.' },
  { step: '03', title: 'Submit Application', description: 'Fill in your details, upload documents, and submit your application.' },
  { step: '04', title: 'Track & Pay', description: 'Monitor your application status and complete fee payments online.' },
];

export default function HomePage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.programs.getAll({ limit: 6, isActive: true });
        setPrograms((res.data as any)?.data || []);
      } catch {
        // silently fail — show fallback placeholders
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar (simple landing version) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">AdmissionsHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#programs" className="hover:text-primary-600 transition-colors">Programs</a>
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Apply Now</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-hero pt-16 min-h-[92vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Star className="w-4 h-4 fill-primary-500" />
              Trusted by 10,000+ students nationwide
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Your Admission Journey,{' '}
              <span className="text-gradient">Simplified & Digital</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Apply online, track your application in real time, submit documents securely, and pay fees — all in one place. The smarter way to manage student admissions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 shadow-lg">
                  Start Your Application
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </a>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/80">
                <Icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need, In One Place
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our admission management portal provides all the tools students and institutions need to make enrollment seamless.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <Card key={title} className="p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Explore Our Programs
              </h2>
              <p className="text-lg text-gray-600">Find the right program that matches your aspirations.</p>
            </div>
            <Link href="/register" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loadingPrograms ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : programs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <Card key={program._id} className="p-6 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                        {program.department}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1 group-hover:text-primary-700 transition-colors">
                        {program.name}
                      </h3>
                    </div>
                    <span className="text-xs bg-accent-50 text-accent-700 px-2 py-1 rounded-md font-medium">
                      {program.level.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{program.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{program.duration}</span>
                    <span className="font-semibold text-gray-800">
                      {program.fees?.currency || 'INR'} {program.fees?.applicationFee?.toLocaleString() || 'N/A'} app. fee
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {program.totalSeats - (program.enrolledSeats || 0)} seats remaining
                    </span>
                    <Link href="/register">
                      <Button variant="ghost" size="sm" className="text-primary-600 h-auto p-0 gap-1">
                        Apply <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Programs will be listed here once available.</p>
              <Link href="/register" className="mt-4 inline-block">
                <Button variant="primary" size="sm">Register to Explore</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Getting started is simple. Follow these four easy steps to begin your admission journey.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ step, title, description }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md">
                  {step}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg text-primary-100 mb-10">
            Join thousands of students who have simplified their admission process through our digital portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 w-full sm:w-auto gap-2 font-semibold shadow-lg">
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Already have an account? Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
