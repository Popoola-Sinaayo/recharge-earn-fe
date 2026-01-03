'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPassword, resetPassword } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import OtpInput from '@/components/ui/OtpInput';
import { Mail, Lock, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onEmailSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await forgotPassword({ email: data.email });
      
      if (response.success) {
        setEmail(data.email);
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpComplete = async (completedOtp: string) => {
    setOtp(completedOtp);
    if (completedOtp.length === 6) {
      setStep('reset');
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    if (otp.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await resetPassword({
        email,
        otp,
        newPassword: data.newPassword,
      });
      
      if (response.success) {
        setStep('success');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a] to-blue-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Password Reset Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <Link href="/login">
            <Button className="w-full">
              Go to Login
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
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
              {step === 'email' ? 'Forgot Password?' : step === 'otp' ? 'Verify OTP' : 'Reset Password'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 'email' 
                ? 'Enter your email to receive a reset code'
                : step === 'otp'
                ? `We've sent a code to ${email}`
                : 'Enter your new password'
              }
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

          {step === 'email' && (
            <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="w-5 h-5" />}
                error={emailErrors.email?.message}
                {...registerEmail('email')}
              />

              <Button type="submit" isLoading={isLoading} className="w-full">
                Send Reset Code
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                  Enter OTP Code
                </label>
                <OtpInput length={6} onComplete={handleOtpComplete} />
              </div>
              <Button 
                onClick={() => setStep('reset')} 
                disabled={otp.length !== 6}
                className="w-full"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {step === 'reset' && (
            <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-6">
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                icon={<Lock className="w-5 h-5" />}
                error={resetErrors.newPassword?.message}
                {...registerReset('newPassword')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                icon={<Lock className="w-5 h-5" />}
                error={resetErrors.confirmPassword?.message}
                {...registerReset('confirmPassword')}
              />

              <Button type="submit" isLoading={isLoading} className="w-full">
                Reset Password
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

