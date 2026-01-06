'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { getWalletBalance } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import { 
  Zap, 
  Smartphone, 
  Wifi, 
  Bolt, 
  Tv, 
  Wallet, 
  TrendingUp,
  ArrowRight,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await getWalletBalance();
        if (response.success) {
          setBalance(response.data.balance);
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, []);

  const services = [
    {
      title: 'Buy Data',
      description: 'Purchase data bundles for all networks',
      icon: Wifi,
      href: '/data',
      color: 'bg-[#2563eb] dark:bg-[#3b82f6]',
    },
    {
      title: 'Buy Airtime',
      description: 'Top up your phone instantly',
      icon: Smartphone,
      href: '/airtime',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Electricity',
      description: 'Pay electricity bills easily',
      icon: Bolt,
      href: '/electricity',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Cable TV',
      description: 'Subscribe to your favorite channels',
      icon: Tv,
      href: '/cable',
      color: 'bg-[#2563eb] dark:bg-[#3b82f6]',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-[#0f172a]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              What would you like to do today?
            </p>
          </motion.div>

          {/* Wallet Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-[#2563eb] dark:bg-[#3b82f6] text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="dark:text-blue-100 text-blue-500 mb-2">
                    Wallet Balance
                  </p>
                  {isLoading ? (
                    <div className="h-12 w-48 bg-blue-500/50 rounded-lg animate-pulse" />
                  ) : (
                    <h2 className="text-4xl font-bold dark:text-white text-gray-900">
                      {formatCurrency(balance)}
                    </h2>
                  )}
                </div>
                <Link href="/wallet">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-4 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer"
                  >
                    <Wallet className="w-8 h-8" />
                  </motion.div>
                </Link>
              </div>
              <div className="mt-6 flex gap-3">
                <Link href="/wallet" className="flex-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gray-100 dark:bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-colors dark:text-white text-gray-900"
                  >
                    Fund Wallet
                  </motion.button>
                </Link>
                <Link href="/wallet?tab=transactions" className="flex-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gray-100 dark:bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-colors dark:text-white text-gray-900"
                  >
                    View History
                  </motion.button>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Quick Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Link key={service.href} href={service.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="h-full"
                    >
                      <Card hover className="h-full">
                        <div
                          className={`w-14 h-14 rounded-xl ${
                            service.color.includes("bg-")
                              ? service.color
                              : `bg-gradient-to-r ${service.color}`
                          } flex items-center justify-center mb-4`}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {service.description}
                        </p>
                        <div className="flex items-center text-[#2563eb] dark:text-[#3b82f6] font-semibold text-sm">
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </Card>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-[#2563eb] dark:text-[#3b82f6]" />
                </div>
              </div>
            </Card> */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    Active Services
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    4
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    Account Status
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Active
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Activity className="w-6 h-6 text-[#2563eb] dark:text-[#3b82f6]" />
                </div>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

