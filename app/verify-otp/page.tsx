'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store';
import { verifyOTP, resendOTP } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import OtpInput from '@/components/ui/OtpInput';
import { Phone, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPhoneNumber, validatePhoneNumber } from '@/lib/utils';

const verifySchema = z.object({
  phone: z.string().refine((val) => validatePhoneNumber(val), {
    message: 'Invalid phone number format',
  }),
});

type VerifyFormData = z.infer<typeof verifySchema>;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState<string>('');
  const [countdown, setCountdown] = useState(0);
  const email = searchParams.get('email') || '';
  const [registrationData, setRegistrationData] = useState<{
    firstName: string;
    lastName: string;
    password: string;
    referralCode?: string;
  } | null>(null);

  useEffect(() => {
    // Get registration data from localStorage if available
    const stored = localStorage.getItem('registrationData');
    if (stored) {
      setRegistrationData(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  const handleOtpComplete = async (completedOtp: string) => {
    setOtp(completedOtp);
  };

  const submitVerification = async (otpValue: string, phoneNumber?: string) => {
    if (!registrationData || !email) {
      setError('Registration data missing. Please register again.');
      return;
    }

    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await verifyOTP({
        email,
        otp: otpValue,
        ...registrationData,
        phone: formatPhoneNumber(phoneNumber),
        referralCode: registrationData.referralCode,
      });
      
      if (response.success) {
        localStorage.removeItem('registrationData');
        setAuth(response.data.user, response.data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: VerifyFormData) => {
    if (otp.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }
    await submitVerification(otp, data.phone);
  };

  const handleResendOtp = async () => {
    if (!registrationData || !email) {
      setError('Registration data missing. Please register again.');
      return;
    }

    try {
      setIsResending(true);
      setError('');
      await resendOTP({
        email,
        ...registrationData,
      });
      setCountdown(60);
      setOtp('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Invalid registration session</p>
          <Button onClick={() => router.push('/register')}>Go to Register</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a] to-blue-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2563eb] dark:bg-[#3b82f6] rounded-2xl mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a 6-digit code to <br />
              <span className="font-semibold">{email}</span>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                Enter OTP Code
              </label>
              <OtpInput length={6} onComplete={handleOtpComplete} />
            </div>

            <Input
              label="Phone Number"
              type="tel"
              placeholder="08012345678"
              icon={<Phone className="w-5 h-5" />}
              error={errors.phone?.message}
              {...register('phone')}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                e.target.value = formatted;
                register('phone').onChange(e);
              }}
            />

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || isResending}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? (
                  `Resend OTP in ${countdown}s`
                ) : (
                  <>
                    <RefreshCw className={`w-4 h-4 inline mr-1 ${isResending ? 'animate-spin' : ''}`} />
                    Resend OTP
                  </>
                )}
              </button>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full" disabled={otp.length !== 6}>
              Verify & Continue
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
      </div>
    }>
      <VerifyOtpForm />
    </Suspense>
  );
}

