'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say', '']).optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { gender: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { confirmPassword, gender, ...rest } = data;
      const payload = { ...rest, ...(gender ? { gender } : {}) };

      const res = await api.auth.register(payload);
      const { user, token } = (res.data as any).data;

      setAuth(user, token);

      toast.success('Account created successfully! Welcome aboard.');
      router.push('/student/dashboard');
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="text-gray-600 mt-1">Start your admission journey today — it&apos;s free</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          type="text"
          placeholder="Your full name"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Date of Birth"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
        </div>

        <Select
          label="Gender"
          options={[
            { value: '', label: 'Select gender (optional)' },
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer_not_to_say', label: 'Prefer not to say' },
          ]}
          error={errors.gender?.message}
          {...register('gender')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 chars, uppercase + number"
            required
            error={errors.password?.message}
            hint="At least 8 characters with one uppercase letter and one number"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Re-enter your password"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="w-full mt-2"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary-600 hover:underline">
          Sign in
        </Link>
      </div>

      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          By creating an account, you agree to our{' '}
          <a href="#" className="underline">Terms of Service</a> and{' '}
          <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
