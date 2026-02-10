'use client';

import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { XCircle, Wallet, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-[#0f172a]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            <Card className="w-full">
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-6"
                >
                  <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </motion.div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Payment Failed
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your payment could not be processed. Please try again.
                </p>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Common reasons for payment failure:</strong>
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 text-left list-disc list-inside space-y-1">
                    <li>Insufficient funds in your account</li>
                    <li>Incorrect card details</li>
                    <li>Network connectivity issues</li>
                    <li>Card declined by your bank</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => router.push('/wallet')} className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/wallet')}
                    className="flex items-center gap-2"
                  >
                    <Wallet className="w-5 h-5" />
                    Back to Wallet
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

