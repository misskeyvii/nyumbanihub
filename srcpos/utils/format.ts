export function formatMoney(amount: number, decimals = 2): string {
  return `KSh ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatCompactMoney(amount: number): string {
  if (amount >= 1_000_000) {
    return `KSh ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `KSh ${(amount / 1_000).toFixed(1)}k`;
  }
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(time: string): string {
  return new Date(time).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}