'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { getReferralCode, getReferralStats } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Gift, Copy, Check, Users, TrendingUp, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

export default function ReferralsPage() {
  const { user } = useAuthStore();
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<{
    totalReferrals: number;
    totalRewards: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    fetchReferralData();
  }, []);

  useEffect(() => {
    if (referralCode) {
      const url = `${window.location.origin}/register?ref=${referralCode}`;
      setShareUrl(url);
    }
  }, [referralCode]);

  const fetchReferralData = async () => {
    try {
      setIsLoading(true);
      const [codeRes, statsRes] = await Promise.all([
        getReferralCode(),
        getReferralStats(),
      ]);

      if (codeRes.success) {
        setReferralCode(codeRes.data.referralCode);
      }

      if (statsRes.success) {
        setStats({
          totalReferrals: statsRes.data.totalReferrals,
          totalRewards: statsRes.data.totalRewards,
        });
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const copyReferralCode = () => {
    if (referralCode) {
      copyToClipboard(referralCode);
    }
  };

  const copyReferralLink = () => {
    if (shareUrl) {
      copyToClipboard(shareUrl);
    }
  };

  const shareReferral = async () => {
    if (navigator.share && shareUrl) {
      try {
        await navigator.share({
          title: 'Join RechargeEarn',
          text: `Use my referral code ${referralCode} to join RechargeEarn and earn rewards!`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

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
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#2563eb] dark:bg-[#3b82f6] rounded-xl">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Referral Program
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Invite friends and earn 1% of their purchases
            </p>
          </motion.div>

          {/* Referral Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-[#2563eb] to-[#3b82f6] dark:from-[#3b82f6] dark:to-[#60a5fa] text-white border-0">
              <div className="text-center mb-6">
                <p className="text-blue-100 dark:text-blue-200 mb-2">Your Referral Code</p>
                {isLoading ? (
                  <div className="h-16 w-48 bg-white/20 rounded-lg animate-pulse mx-auto" />
                ) : (
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="bg-white/20 backdrop-blur-sm px-8 py-4 rounded-2xl">
                      <h2 className="text-5xl font-bold tracking-wider">{referralCode || '------'}</h2>
                    </div>
                    <button
                      onClick={copyReferralCode}
                      className="p-4 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-colors"
                      aria-label="Copy referral code"
                    >
                      {copied ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Copy className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                )}
                <p className="text-blue-100 dark:text-blue-200 text-sm mb-4">
                  Share this code with friends to earn rewards
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="secondary"
                    onClick={copyReferralLink}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={shareReferral}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Referrals</p>
                  {isLoading ? (
                    <div className="h-10 w-24 bg-gray-100 dark:bg-[#334155] rounded-lg animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats?.totalReferrals || 0}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Users className="w-8 h-8 text-[#2563eb] dark:text-[#3b82f6]" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Rewards</p>
                  {isLoading ? (
                    <div className="h-10 w-32 bg-gray-100 dark:bg-[#334155] rounded-lg animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats ? formatCurrency(stats.totalRewards) : formatCurrency(0)}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                How It Works
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] dark:bg-[#3b82f6] text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Share Your Code
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Share your referral code or link with friends and family
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] dark:bg-[#3b82f6] text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      They Sign Up
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your friends register using your referral code
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] dark:bg-[#3b82f6] text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      You Earn Rewards
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Earn 1% of every purchase your referrals make (data, airtime, cable, electricity)
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}


