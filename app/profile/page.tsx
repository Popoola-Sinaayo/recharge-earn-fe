'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { getUserProfile, changePassword } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { User, Mail, Phone, Lock, Edit, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState(user);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getUserProfile();
      if (response.success) {
        setProfile(response.data);
        setAuth(response.data, localStorage.getItem('token') || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordChange = async (data: ChangePasswordFormData) => {
    try {
      const response = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.success) {
        setPasswordChangeSuccess(true);
        reset();
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordChangeSuccess(false);
        }, 2000);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-[#0f172a]">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account information
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Personal Information
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#1e293b] rounded-xl">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {profile?.firstName} {profile?.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#1e293b] rounded-xl">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                      <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email Address</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {profile?.email}
                      </p>
                      {profile?.isEmailVerified && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {profile?.phone && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#1e293b] rounded-xl">
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                        <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone Number</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {profile.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#1e293b] rounded-xl">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                      <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Password</p>
                      <p className="font-semibold text-gray-900 dark:text-white">••••••••</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPasswordModalOpen(true)}
                    >
                      <Edit className="w-4 h-4" />
                      Change
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-[#2563eb] dark:bg-[#3b82f6] rounded-full mb-4">
                    <span className="text-3xl font-bold text-white">
                      {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {profile?.firstName} {profile?.lastName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {profile?.email}
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-[#1e293b] rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {profile?.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-[#1e293b] rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Change Password Modal */}
          <Modal
            isOpen={isPasswordModalOpen}
            onClose={() => {
              setIsPasswordModalOpen(false);
              reset();
              setPasswordChangeSuccess(false);
            }}
            title={passwordChangeSuccess ? 'Password Changed!' : 'Change Password'}
          >
            {passwordChangeSuccess ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-lg text-gray-900 dark:text-white">
                  Your password has been changed successfully!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onPasswordChange)} className="space-y-6">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                  icon={<Lock className="w-5 h-5" />}
                  error={errors.currentPassword?.message}
                  {...register('currentPassword')}
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  icon={<Lock className="w-5 h-5" />}
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                  icon={<Lock className="w-5 h-5" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      reset();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Change Password
                  </Button>
                </div>
              </form>
            )}
          </Modal>
        </main>
      </div>
    </ProtectedRoute>
  );
}

