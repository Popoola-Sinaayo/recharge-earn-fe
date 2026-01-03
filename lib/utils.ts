export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function generateReference(): string {
  return `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(0|\+234)[789][01]\d{8}$/;
  return phoneRegex.test(phone);
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert to format: 0XXXXXXXXXX
  if (cleaned.startsWith('234')) {
    return '0' + cleaned.substring(3);
  }
  if (cleaned.startsWith('0')) {
    return cleaned;
  }
  return '0' + cleaned;
}

export function getTransactionCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    funding: 'Wallet Funding',
    data_purchase: 'Data Purchase',
    airtime_purchase: 'Airtime Purchase',
    electricity_purchase: 'Electricity Purchase',
    cable_purchase: 'Cable Subscription',
    refund: 'Refund',
    withdrawal: 'Withdrawal',
    referral_reward: 'Referral Reward',
  };
  return labels[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

