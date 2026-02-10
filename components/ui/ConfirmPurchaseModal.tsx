'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface ConfirmDetail {
  label: string;
  value: string | number;
}

interface ConfirmPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  details: ConfirmDetail[];
  amount: number;
  isLoading?: boolean;
  confirmLabel?: string;
}

const NO_REFUND_WARNING =
  'Wrong details are not refundable. Please confirm the information above before proceeding.';

export default function ConfirmPurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  details,
  amount,
  isLoading = false,
  confirmLabel = 'Confirm & Pay',
}: ConfirmPurchaseModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6">
        <div className="space-y-3">
          {details.map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-[#334155] last:border-0"
            >
              <span className="text-gray-600 dark:text-gray-400">{label}</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {typeof value === 'number' ? formatCurrency(value) : value}
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#2563eb]/10 dark:bg-[#3b82f6]/10 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Total</span>
            <span className="text-2xl font-bold text-[#2563eb] dark:text-[#3b82f6]">
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">{NO_REFUND_WARNING}</p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} isLoading={isLoading} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
