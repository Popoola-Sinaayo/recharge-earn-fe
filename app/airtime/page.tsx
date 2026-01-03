'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { purchaseAirtime } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Smartphone, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatPhoneNumber, generateReference, validatePhoneNumber } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const purchaseSchema = z.object({
  phone_number: z.string().refine((val) => validatePhoneNumber(val), {
    message: 'Invalid phone number format',
  }),
  amount: z.number().min(50, 'Minimum amount is ₦50'),
  network: z.enum(['MTN', 'AIRTEL', 'GLO', '9MOBILE']),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

export default function AirtimePage() {
  const { user } = useAuthStore();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      phone_number: user?.phone || '',
      network: 'MTN',
    },
  });

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];
  const networks = ['MTN', 'AIRTEL', 'GLO', '9MOBILE'];

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      setIsPurchasing(true);
      const response = await purchaseAirtime({
        phone_number: formatPhoneNumber(data.phone_number),
        amount: data.amount,
        network: data.network,
        reference: generateReference(),
      });

      if (response.success) {
        setPurchaseSuccess(true);
        reset();
        setTimeout(() => {
          setPurchaseSuccess(false);
        }, 3000);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to purchase airtime');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-[#0f172a]">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Buy Airtime
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Top up your phone instantly
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              {purchaseSuccess ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-lg text-gray-900 dark:text-white mb-2">
                    Airtime purchase successful!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your airtime will be credited shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Select Network
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {networks.map((network) => (
                        <button
                          key={network}
                          type="button"
                          onClick={() => {
                            register('network').onChange({ target: { value: network } });
                          }}
                          className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                            watch('network') === network
                              ? 'bg-[#2563eb] dark:bg-[#3b82f6] text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-[#334155] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {network}
                        </button>
                      ))}
                    </div>
                    {errors.network && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.network.message}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="08012345678"
                    error={errors.phone_number?.message}
                    {...register('phone_number')}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      e.target.value = formatted;
                      register('phone_number').onChange(e);
                    }}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Amount (NGN)
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-3">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            register('amount').onChange({ target: { value: amount } });
                          }}
                          className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                            watch('amount') === amount
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-2 border-blue-500'
                              : 'bg-gray-100 dark:bg-[#334155] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          ₦{amount}
                        </button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      placeholder="Or enter custom amount"
                      error={errors.amount?.message}
                      {...register('amount', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {watch('amount') ? formatCurrency(watch('amount')) : '₦0.00'}
                      </span>
                    </div>
                  </div>

                  <Button type="submit" isLoading={isPurchasing} className="w-full">
                    Purchase Airtime
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

