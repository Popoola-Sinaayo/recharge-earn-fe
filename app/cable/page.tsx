'use client';

import { useState } from 'react';
import { purchaseCable } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Tv, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateReference } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const purchaseSchema = z.object({
  smartcard_number: z.string().min(10, 'Smartcard number must be at least 10 digits'),
  plan_id: z.number().min(1, 'Please select a plan'),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

const cablePlans = [
  { id: 1, name: 'DStv Compact', provider: 'DStv', price: 7900 },
  { id: 2, name: 'DStv Premium', provider: 'DStv', price: 24500 },
  { id: 3, name: 'GOtv Max', provider: 'GOtv', price: 4900 },
  { id: 4, name: 'GOtv Jolli', provider: 'GOtv', price: 3200 },
  { id: 5, name: 'StarTimes Nova', provider: 'StarTimes', price: 1500 },
  { id: 6, name: 'StarTimes Basic', provider: 'StarTimes', price: 2500 },
];

export default function CablePage() {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
  });

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      setIsPurchasing(true);
      const response = await purchaseCable({
        smartcard_number: data.smartcard_number,
        plan_id: data.plan_id,
      });

      if (response.success) {
        setPurchaseSuccess(true);
        reset();
        setTimeout(() => {
          setPurchaseSuccess(false);
        }, 3000);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to purchase cable subscription');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-[#0f172a]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#2563eb] dark:bg-[#3b82f6] rounded-xl">
                <Tv className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Cable TV Subscription
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Subscribe to your favorite TV channels
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Select Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cablePlans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        setValue('plan_id', plan.id);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedPlan === plan.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {plan.name}
                        </span>
                        {selectedPlan === plan.id && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {plan.provider}
                      </p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ₦{plan.price.toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
                {errors.plan_id && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.plan_id.message}
                  </p>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                {purchaseSuccess ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                      <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-lg text-gray-900 dark:text-white mb-2">
                      Subscription successful!
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your subscription will be activated shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Complete Purchase
                    </h3>

                    <Input
                      label="Smartcard Number"
                      type="text"
                      placeholder="Enter your smartcard number"
                      error={errors.smartcard_number?.message}
                      {...register('smartcard_number')}
                    />

                    <input type="hidden" {...register('plan_id', { valueAsNumber: true })} />

                    {selectedPlan && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Plan</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {cablePlans.find((p) => p.id === selectedPlan)?.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gray-600 dark:text-gray-400">Amount</span>
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            ₦{cablePlans.find((p) => p.id === selectedPlan)?.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      isLoading={isPurchasing}
                      className="w-full"
                      disabled={!selectedPlan}
                    >
                      Subscribe Now
                    </Button>
                  </form>
                )}
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

