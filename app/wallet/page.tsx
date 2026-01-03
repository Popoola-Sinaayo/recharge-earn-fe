'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { getWalletBalance, getWalletTransactions, initializePayment } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, History, Wifi, Smartphone, Bolt, Tv, Gift, RefreshCw, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, getTransactionCategoryLabel } from '@/lib/utils';
import { Transaction } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const fundSchema = z.object({
  amount: z.number().min(100, 'Minimum amount is ₦100'),
  email: z.string().email('Invalid email address'),
});

type FundFormData = z.infer<typeof fundSchema>;

function WalletPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTokenModal, setShowTokenModal] = useState<{ token: string; meterNumber?: string } | null>(null);
  const activeTab = searchParams.get('tab') || 'overview';

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      funding: <Wallet className="w-5 h-5" />,
      data_purchase: <Wifi className="w-5 h-5" />,
      airtime_purchase: <Smartphone className="w-5 h-5" />,
      electricity_purchase: <Bolt className="w-5 h-5" />,
      cable_purchase: <Tv className="w-5 h-5" />,
      refund: <RefreshCw className="w-5 h-5" />,
      withdrawal: <ArrowUpRight className="w-5 h-5" />,
      referral_reward: <Gift className="w-5 h-5" />,
    };
    return iconMap[category] || <History className="w-5 h-5" />;
  };

  // Get category color
  const getCategoryColor = (category: string, type: 'credit' | 'debit') => {
    if (type === 'credit') {
      const creditColors: Record<string, string> = {
        funding: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        refund: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
        referral_reward: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      };
      return creditColors[category] || 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    }
    const debitColors: Record<string, string> = {
      data_purchase: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      airtime_purchase: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
      electricity_purchase: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      cable_purchase: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    };
    return debitColors[category] || 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
  };

  // Filter transactions by category
  const filteredTransactions = selectedCategory === 'all' 
    ? transactions 
    : transactions.filter(t => t.category === selectedCategory);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FundFormData>({
    resolver: zodResolver(fundSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions({ limit: 20 }),
      ]);

      if (balanceRes.success) {
        setBalance(balanceRes.data.balance);
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onFundSubmit = async (data: FundFormData) => {
    try {
      setIsFunding(true);
      const response = await initializePayment({
        email: data.email,
        amount: data.amount,
      });

      if (response.success) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorizationUrl;
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setIsFunding(false);
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Wallet
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your wallet balance and transactions
            </p>
          </motion.div>

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-[#2563eb] dark:bg-[#3b82f6] text-white border-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-blue-100 mb-2">Available Balance</p>
                  {isLoading ? (
                    <div className="h-12 w-48 bg-blue-500/50 rounded-lg animate-pulse" />
                  ) : (
                    <h2 className="text-5xl font-bold">{formatCurrency(balance)}</h2>
                  )}
                </div>
                <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Wallet className="w-12 h-12" />
                </div>
              </div>
              <Button
                onClick={() => setIsFundModalOpen(true)}
                variant="secondary"
                className="w-full"
              >
                <Plus className="w-5 h-5" />
                Fund Wallet
              </Button>
            </Card>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => router.push('/wallet')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#2563eb] dark:bg-[#3b82f6] text-white'
                  : 'bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#334155]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => router.push('/wallet?tab=transactions')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'bg-[#2563eb] dark:bg-[#3b82f6] text-white'
                  : 'bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#334155]'
              }`}
            >
              <History className="w-5 h-5" />
              Transactions
            </button>
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                    <ArrowDownLeft className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Credits</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(
                        transactions
                          .filter((t) => t.type === 'credit')
                          .reduce((sum, t) => sum + t.amount, 0)
                      )}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                    <ArrowUpRight className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Debits</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(
                        transactions
                          .filter((t) => t.type === 'debit')
                          .reduce((sum, t) => sum + t.amount, 0)
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Transaction History
                  </h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="funding">Wallet Funding</option>
                    <option value="data_purchase">Data Purchase</option>
                    <option value="airtime_purchase">Airtime Purchase</option>
                    <option value="electricity_purchase">Electricity</option>
                    <option value="cable_purchase">Cable TV</option>
                    <option value="refund">Refunds</option>
                    <option value="referral_reward">Referral Rewards</option>
                  </select>
                </div>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 dark:bg-[#334155] rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedCategory === 'all' ? 'No transactions yet' : `No ${getTransactionCategoryLabel(selectedCategory).toLowerCase()} transactions`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="p-4 bg-gray-50 dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-[#334155] hover:border-[#2563eb] dark:hover:border-[#3b82f6] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-3 rounded-xl ${getCategoryColor(transaction.category, transaction.type)}`}>
                              {getCategoryIcon(transaction.category)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {transaction.description || getTransactionCategoryLabel(transaction.category)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatDate(transaction.createdAt)}
                                </p>
                                {transaction.metadata?.phone_number && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {transaction.metadata.phone_number}
                                    </p>
                                  </>
                                )}
                                {transaction.metadata?.network && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {transaction.metadata.network}
                                    </p>
                                  </>
                                )}
                              </div>
                              {transaction.category === 'electricity_purchase' && transaction.token && (
                                <button
                                  onClick={() => setShowTokenModal({ 
                                    token: transaction.token!, 
                                    meterNumber: transaction.metadata?.meter_number as string 
                                  })}
                                  className="mt-2 text-sm text-[#2563eb] dark:text-[#3b82f6] hover:underline font-medium"
                                >
                                  View Electricity Token →
                                </button>
                              )}
                              {transaction.category === 'refund' && transaction.metadata?.reason && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                  Reason: {transaction.metadata.reason}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold text-lg ${
                                transaction.type === 'credit'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {transaction.type === 'credit' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {transaction.status}
                            </p>
                            {transaction.reference && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                                {transaction.reference.slice(0, 12)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Electricity Token Modal */}
          <Modal
            isOpen={!!showTokenModal}
            onClose={() => setShowTokenModal(null)}
            title="Electricity Token"
            size="md"
          >
            {showTokenModal && (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Electricity Token</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-wider text-center mb-4">
                    {showTokenModal.token}
                  </p>
                  {showTokenModal.meterNumber && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Meter: {showTokenModal.meterNumber}
                    </p>
                  )}
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Instructions:</strong> Enter this token into your prepaid meter to activate your electricity units.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(showTokenModal.token);
                    }}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Token
                  </Button>
                  <Button
                    onClick={() => setShowTokenModal(null)}
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          {/* Fund Wallet Modal */}
          <Modal
            isOpen={isFundModalOpen}
            onClose={() => {
              setIsFundModalOpen(false);
              reset();
            }}
            title="Fund Wallet"
          >
            <form onSubmit={handleSubmit(onFundSubmit)} className="space-y-6">
              <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register('email')}
                disabled
              />
              <Input
                label="Amount (NGN)"
                type="number"
                placeholder="Enter amount"
                error={errors.amount?.message}
                {...register('amount', { valueAsNumber: true })}
              />
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFundModalOpen(false);
                    reset();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isFunding} className="flex-1">
                  Continue to Payment
                </Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
        </div>
      </ProtectedRoute>
    }>
      <WalletPageContent />
    </Suspense>
  );
}

