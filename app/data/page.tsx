/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { getDataPlans, purchaseData } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmPurchaseModal from '@/components/ui/ConfirmPurchaseModal';
import { Wifi, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatPhoneNumber, generateReference, validatePhoneNumber } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataPlan } from '@/lib/api';

const purchaseSchema = z.object({
  phone_number: z.string().refine((val) => validatePhoneNumber(val), {
    message: 'Invalid phone number format',
  }),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

export default function DataPage() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<{ [key: string]: DataPlan[] }>({});
  const [selectedNetwork, setSelectedNetwork] = useState<string>('MTN');
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      phone_number: user?.phone || '',
    },
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await getDataPlans();
      console.log(response)
      if (response.success && response.data) {
        setPlans(response.data as unknown as { [key: string]: DataPlan[] });
      }
    } catch (error) {
      console.error('Failed to fetch data plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (plan: DataPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
    setPurchaseSuccess(false);
  };

  const onConfirmOpen = (data: PurchaseFormData) => {
    setPendingPhone(formatPhoneNumber(data.phone_number));
    setShowConfirmModal(true);
  };

  const onConfirmSubmit = async () => {
    if (!selectedPlan) return;

    try {
      setIsPurchasing(true);
      setShowConfirmModal(false);
      const response = await purchaseData({
        phone_number: pendingPhone,
        plan_id: selectedPlan.id,
        reference: generateReference(),
      });

      if (response.success) {
        setPurchaseSuccess(true);
        reset();
        setPendingPhone('');
        setTimeout(() => {
          setIsModalOpen(false);
          setPurchaseSuccess(false);
          fetchPlans();
        }, 2000);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to purchase data');
    } finally {
      setIsPurchasing(false);
    }
  };

  const networks = ['MTN', 'AIRTEL', 'GLO', '9MOBILE'];

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
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Buy Data
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Select a network and choose your data plan
            </p>
          </motion.div>

          {/* Network Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-3">
              {networks.map((network) => (
                <button
                  key={network}
                  onClick={() => setSelectedNetwork(network)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedNetwork === network
                      ? 'bg-[#2563eb] dark:bg-[#3b82f6] text-white shadow-lg'
                      : 'bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#334155]'
                  }`}
                >
                  {network}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Data Plans */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {plans[selectedNetwork]?.map((plan) => (
                <Card key={plan.id} hover>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {plan.name}
                      </h3>
                      {plan.mb_value && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.mb_value} MB
                        </p>
                      )}
                    </div>
                    {plan.status === 0 && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold">
                        Available
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(parseFloat(plan.wallet_price || plan.price))}
                    </p>
                    {plan.atm_price && parseFloat(plan.atm_price) > parseFloat(plan.wallet_price || plan.price) && (
                      <p className="text-sm text-gray-500 line-through">
                        {formatCurrency(parseFloat(plan.atm_price))}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={plan.status !== 0}
                    className="w-full"
                  >
                    Buy Now
                  </Button>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Purchase Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              reset();
              setPurchaseSuccess(false);
            }}
            title={purchaseSuccess ? 'Purchase Successful!' : 'Confirm Purchase'}
          >
            {purchaseSuccess ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-lg text-gray-900 dark:text-white mb-2">
                  Data purchase successful!
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Your data will be credited shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onConfirmOpen)} className="space-y-6">
                {selectedPlan && (
                  <div className="p-4 bg-gray-50 dark:bg-[#1e293b] rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Plan</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedPlan.name}</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                      {formatCurrency(parseFloat(selectedPlan.wallet_price || selectedPlan.price))}
                    </p>
                  </div>
                )}
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
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      reset();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Continue
                  </Button>
                </div>
              </form>
            )}
          </Modal>

          <ConfirmPurchaseModal
            isOpen={showConfirmModal}
            onClose={() => {
              setShowConfirmModal(false);
              setPendingPhone('');
            }}
            onConfirm={onConfirmSubmit}
            title="Confirm Data Purchase"
            details={
              selectedPlan && pendingPhone
                ? [
                    { label: 'Plan', value: selectedPlan.name },
                    { label: 'Phone Number', value: pendingPhone },
                    { label: 'Network', value: selectedNetwork },
                  ]
                : []
            }
            amount={selectedPlan ? parseFloat(selectedPlan.wallet_price || selectedPlan.price) : 0}
            isLoading={isPurchasing}
            confirmLabel="Confirm & Purchase"
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}

