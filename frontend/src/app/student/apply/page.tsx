'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import type { Program } from '@/types';

const step1Schema = z.object({ program: z.string().min(1, 'Please select a program') });

const step2Schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  dateOfBirth: z.string().min(1, 'Required'),
  gender: z.string().min(1, 'Required'),
  phone: z.string().min(10, 'Valid phone required'),
  alternatePhone: z.string().optional(),
  nationality: z.string().min(1, 'Required'),
  religion: z.string().optional(),
  category: z.string().optional(),
  address_street: z.string().min(1, 'Required'),
  address_city: z.string().min(1, 'Required'),
  address_state: z.string().min(1, 'Required'),
  address_country: z.string().min(1, 'Required'),
  address_zipCode: z.string().min(1, 'Required'),
});

const step3Schema = z.object({
  highestQualification: z.string().min(1, 'Required'),
  boardUniversity: z.string().min(1, 'Required'),
  yearOfPassing: z.string().min(4, 'Required'),
  percentage: z.coerce.number().min(0).max(100),
  stream: z.string().optional(),
  subjects: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

type AllData = Step1Data & Step2Data & Step3Data;

const STEPS = ['Select Program', 'Personal Details', 'Academic Details', 'Review & Submit'];

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AllData>>({});
  const [submitting, setSubmitting] = useState(false);

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });
  const form3 = useForm<Step3Data>({ resolver: zodResolver(step3Schema) });
  const requestedProgramId = searchParams.get('programId');
  const setSelectedProgramValue = form1.setValue;
  const selectedProgramId = form1.watch('program') || formData.program;

  useEffect(() => {
    let isMounted = true;

    const loadPrograms = async () => {
      setProgramsLoading(true);
      setProgramsError(null);

      try {
        const res = await api.programs.getAll({ isActive: true, limit: 50 });
        const nextPrograms: Program[] = Array.isArray((res.data as any)?.data)
          ? (res.data as any).data
          : [];

        if (!isMounted) {
          return;
        }

        setPrograms(nextPrograms);

        if (requestedProgramId && nextPrograms.some((program) => program._id === requestedProgramId)) {
          setSelectedProgramValue('program', requestedProgramId, { shouldValidate: true });
          setFormData((prev) => ({ ...prev, program: requestedProgramId }));
        }
      } catch (err: any) {
        if (!isMounted) {
          return;
        }

        setPrograms([]);
        setProgramsError(err.response?.data?.message || 'Unable to load programs right now.');
      } finally {
        if (isMounted) {
          setProgramsLoading(false);
        }
      }
    };

    loadPrograms();

    return () => {
      isMounted = false;
    };
  }, [requestedProgramId, setSelectedProgramValue]);

  const nextStep = (data: Partial<AllData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((s) => s + 1);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const d = formData as AllData;

      // First create draft
      const res = await api.applications.create({
        program: d.program,
        personalDetails: {
          firstName: d.firstName,
          lastName: d.lastName,
          dateOfBirth: d.dateOfBirth,
          gender: d.gender,
          phone: d.phone,
          alternatePhone: d.alternatePhone,
          nationality: d.nationality,
          religion: d.religion,
          category: d.category,
          address: {
            street: d.address_street,
            city: d.address_city,
            state: d.address_state,
            country: d.address_country,
            zipCode: d.address_zipCode,
          },
        },
        academicDetails: {
          highestQualification: d.highestQualification,
          boardUniversity: d.boardUniversity,
          yearOfPassing: parseInt(d.yearOfPassing),
          percentage: d.percentage,
          stream: d.stream,
          subjects: d.subjects ? d.subjects.split(',').map((s) => s.trim()) : [],
        },
      });

      const appId = (res.data as any).data?._id;

      // Then submit
      if (appId) {
        await api.applications.submit(appId);
      }

      toast.success('Application submitted successfully!');
      router.push('/student/applications');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProgram = programs.find((p) => p._id === selectedProgramId);

  return (
    <div className="container-page max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Apply for Admission</h1>
        <p className="text-gray-500 mt-1">Complete the form below to submit your application</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step
                    ? 'bg-green-500 text-white'
                    : i === step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${i === step ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mx-1 mb-4 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Select Program */}
      {step === 0 && (
        <Card title="Select a Program">
          <form onSubmit={form1.handleSubmit(nextStep)} className="space-y-4">
            <Select
              label="Program"
              required
              options={[
                {
                  value: '',
                  label: programsLoading
                    ? 'Loading programs...'
                    : programs.length > 0
                      ? 'Choose a program...'
                      : 'No programs available',
                },
                ...programs.map((p) => ({ value: p._id, label: `${p.name} (${p.level} · ${p.department})` })),
              ]}
              error={form1.formState.errors.program?.message}
              {...form1.register('program')}
            />
            {programsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {programsError}
              </div>
            )}
            {!programsLoading && !programsError && programs.length === 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                No active programs are available right now. Please contact the admissions team or try again later.
              </div>
            )}
            {selectedProgram && (
              <div className="bg-primary-50 rounded-xl p-4 text-sm text-primary-800">
                <strong>{selectedProgram.name}</strong>
                <p className="mt-1 text-primary-600">{selectedProgram.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-primary-500">
                  <span>Duration: {selectedProgram.duration}</span>
                  <span>Seats: {selectedProgram.totalSeats - (selectedProgram.enrolledSeats || 0)} remaining</span>
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={programsLoading || programs.length === 0}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next: Personal Details
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 1: Personal Details */}
      {step === 1 && (
        <Card title="Personal Details">
          <form onSubmit={form2.handleSubmit(nextStep)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" required error={form2.formState.errors.firstName?.message} {...form2.register('firstName')} />
              <Input label="Last Name" required error={form2.formState.errors.lastName?.message} {...form2.register('lastName')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date of Birth" type="date" required error={form2.formState.errors.dateOfBirth?.message} {...form2.register('dateOfBirth')} />
              <Select
                label="Gender"
                required
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                error={form2.formState.errors.gender?.message}
                {...form2.register('gender')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone" type="tel" required error={form2.formState.errors.phone?.message} {...form2.register('phone')} />
              <Input label="Alternate Phone" type="tel" error={form2.formState.errors.alternatePhone?.message} {...form2.register('alternatePhone')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nationality" required error={form2.formState.errors.nationality?.message} {...form2.register('nationality')} />
              <Select
                label="Category"
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'general', label: 'General' },
                  { value: 'obc', label: 'OBC' },
                  { value: 'sc', label: 'SC' },
                  { value: 'st', label: 'ST' },
                  { value: 'ews', label: 'EWS' },
                ]}
                error={form2.formState.errors.category?.message}
                {...form2.register('category')}
              />
            </div>
            <p className="text-sm font-medium text-gray-700 pt-2 border-t border-gray-100">Address</p>
            <Input label="Street / Area" required error={form2.formState.errors.address_street?.message} {...form2.register('address_street')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" required error={form2.formState.errors.address_city?.message} {...form2.register('address_city')} />
              <Input label="State" required error={form2.formState.errors.address_state?.message} {...form2.register('address_state')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Country" required error={form2.formState.errors.address_country?.message} {...form2.register('address_country')} />
              <Input label="Zip / Postal Code" required error={form2.formState.errors.address_zipCode?.message} {...form2.register('address_zipCode')} />
            </div>
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep(0)}>Back</Button>
              <Button type="submit" variant="primary" rightIcon={<ChevronRight className="w-4 h-4" />}>Next: Academic Details</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 2: Academic Details */}
      {step === 2 && (
        <Card title="Academic Details">
          <form onSubmit={form3.handleSubmit(nextStep)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Highest Qualification" required placeholder="e.g., 12th Standard" error={form3.formState.errors.highestQualification?.message} {...form3.register('highestQualification')} />
              <Input label="Board / University" required error={form3.formState.errors.boardUniversity?.message} {...form3.register('boardUniversity')} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Year of Passing" required placeholder="e.g., 2024" type="number" error={form3.formState.errors.yearOfPassing?.message} {...form3.register('yearOfPassing')} />
              <Input label="Percentage / CGPA" required type="number" step="0.01" error={form3.formState.errors.percentage?.message} {...form3.register('percentage')} />
              <Input label="Stream" placeholder="e.g., Science" error={form3.formState.errors.stream?.message} {...form3.register('stream')} />
            </div>
            <Textarea label="Subjects (comma-separated)" placeholder="Physics, Chemistry, Mathematics" error={form3.formState.errors.subjects?.message} {...form3.register('subjects')} />
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" variant="primary" rightIcon={<ChevronRight className="w-4 h-4" />}>Next: Review</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <Card title="Review & Submit">
          <div className="space-y-5 text-sm">
            <ReviewSection title="Program">
              <Row label="Selected Program" value={selectedProgram?.name || formData.program} />
            </ReviewSection>

            <ReviewSection title="Personal Details">
              <Row label="Full Name" value={`${formData.firstName} ${formData.lastName}`} />
              <Row label="Date of Birth" value={formData.dateOfBirth} />
              <Row label="Gender" value={formData.gender} />
              <Row label="Phone" value={formData.phone} />
              <Row label="Nationality" value={formData.nationality} />
              <Row label="Address" value={`${formData.address_street}, ${formData.address_city}, ${formData.address_state} ${formData.address_zipCode}, ${formData.address_country}`} />
            </ReviewSection>

            <ReviewSection title="Academic Details">
              <Row label="Qualification" value={formData.highestQualification} />
              <Row label="Board / University" value={formData.boardUniversity} />
              <Row label="Year of Passing" value={formData.yearOfPassing} />
              <Row label="Percentage" value={`${formData.percentage}%`} />
              <Row label="Stream" value={formData.stream} />
            </ReviewSection>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs">
              By submitting, you confirm that all information provided is accurate and complete. False information may result in disqualification.
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep(2)}>Back</Button>
              <Button variant="primary" loading={submitting} onClick={handleFinalSubmit}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2 pb-1 border-b border-gray-100">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 min-w-36">{label}:</span>
      <span className="text-gray-800 font-medium">{value || '—'}</span>
    </div>
  );
}
