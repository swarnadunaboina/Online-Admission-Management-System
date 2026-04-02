'use client';

import { useEffect, useState } from 'react';
import { Search, BookOpen, Users, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import type { Program } from '@/types';

const LEVELS = ['all', 'undergraduate', 'postgraduate', 'diploma', 'certificate', 'phd'];

export default function StudentProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [dept, setDept] = useState('all');

  useEffect(() => {
    Promise.all([
      api.programs.getAll({ isActive: true, limit: 100 }).then((r) => {
        setPrograms((r.data as any).data || []);
      }),
      api.programs.getDepartments().then((r) => {
        setDepartments((r.data as any).data || []);
      }),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = programs.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === 'all' || p.level === level;
    const matchDept = dept === 'all' || p.department === dept;
    return matchSearch && matchLevel && matchDept;
  });

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Explore Programs</h1>
        <p className="text-gray-500 mt-1">Browse all available programs and find the right fit</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search programs or departments..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="input-base sm:w-40 capitalize"
        >
          {LEVELS.map((l) => <option key={l} value={l}>{l === 'all' ? 'All Levels' : l}</option>)}
        </select>
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="input-base sm:w-52"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {filtered.length} program{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Programs Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No programs match your filters.</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setSearch(''); setLevel('all'); setDept('all'); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Card key={p._id} className="p-6 hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                  {p.department}
                </span>
                <span className="text-xs bg-accent-50 text-accent-700 px-2 py-0.5 rounded-md font-medium capitalize">
                  {p.level}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors mb-2">
                {p.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-4">{p.description}</p>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {p.duration}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />
                    {p.totalSeats - (p.enrolledSeats || 0)} seats left
                  </span>
                </div>
                {p.fees?.applicationFee != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Application Fee</span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(p.fees.applicationFee, p.fees.currency)}
                    </span>
                  </div>
                )}
              </div>

              <Link href={`/student/apply?programId=${p._id}`} className="mt-4">
                <Button variant="primary" size="sm" className="w-full">Apply Now</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
