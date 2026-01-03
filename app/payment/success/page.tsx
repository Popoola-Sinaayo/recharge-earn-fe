'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { verifyPayment, getWalletBalance } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle, XCircle, Loader2, Wallet, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [error, setError] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<{
    amount?: number;
    reference?: string;
  } | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref'); // Paystack sometimes uses trxref
    
    const paymentRef = reference || trxref;

    if (paymentRef) {
      verifyPaymentWithReference(paymentRef);
    } else {
      setStatus('failed');
      setError('No payment reference found');
    }
  }, [searchParams]);

  const verifyPaymentWithReference = async (reference: string) => {
    try {
      setStatus('verifying');
      const response = await verifyPayment(reference);

      if (response.success) {
        // Extract payment details from response
        const paymentData = response.data as any;
        const amount = paymentData?.data?.amount 
          ? paymentData.data.amount / 100 // Paystack returns amount in kobo
          : undefined;

        setPaymentDetails({
          amount,
          reference,
        });

        // Fetch updated wallet balance
        try {
          const balanceResponse = await getWalletBalance();
          if (balanceResponse.success) {
            setNewBalance(balanceResponse.data.balance);
          }
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }

        setStatus('success');
      } else {
        setStatus('failed');
        setError(response.message || 'Payment verification failed');
      }
    } catch (err: any) {
      setStatus('failed');
      setError(
        err.response?.data?.message || 
        'Failed to verify payment. Please check your wallet balance or contact support.'
      );
    }
  };

  const handleGoToWallet = () => {
    router.push('/wallet');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

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
            {status === 'verifying' && (
              <Card className="w-full text-center">
                <div className="py-12">
                  <Loader2 className="w-16 h-16 animate-spin text-[#2563eb] dark:text-[#3b82f6] mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Verifying Payment...
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we confirm your payment
                  </p>
                </div>
              </Card>
            )}

            {status === 'success' && (
              <Card className="w-full">
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-6"
                  >
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </motion.div>

                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Payment Successful! 🎉
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Your wallet has been funded successfully
                  </p>

                  {paymentDetails?.amount && (
                    <div className="bg-gray-50 dark:bg-[#1e293b] rounded-xl p-6 mb-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(paymentDetails.amount)}
                          </span>
                        </div>
                        {paymentDetails.reference && (
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-[#334155]">
                            <span className="text-gray-600 dark:text-gray-400">Reference</span>
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              {paymentDetails.reference}
                            </span>
                          </div>
                        )}
                        {newBalance !== null && (
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-[#334155]">
                            <span className="text-gray-600 dark:text-gray-400">New Balance</span>
                            <span className="text-xl font-bold text-[#2563eb] dark:text-[#3b82f6]">
                              {formatCurrency(newBalance)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleGoToWallet} className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      View Wallet
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGoToDashboard}
                      className="flex items-center gap-2"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {status === 'failed' && (
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
                    Payment Verification Failed
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error || 'We couldn\'t verify your payment. Please check your wallet balance or try again.'}
                  </p>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> If you completed the payment, it may take a few minutes to reflect in your wallet. 
                      Please check your transaction history or contact support if the issue persists.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleGoToWallet} className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Check Wallet
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/wallet')}
                      className="flex items-center gap-2"
                    >
                      Try Again
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

