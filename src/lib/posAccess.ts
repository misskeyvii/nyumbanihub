// POS access eligibility checker
export function checkPosEligibility(
  primaryAccountType: string,
  approvedTypes: string[],
  subscriptionExpiresAt: string | null,
  subscriptionDetails: any
) {
  // All account types can now access POS (no restrictions)
  // But pricing differs based on whether they have active accounts

  // Check if user has any active account
  const hasActiveAccount = subscriptionExpiresAt && new Date(subscriptionExpiresAt) > new Date();
  
  // Determine the user's primary account type for POS
  const accountType = primaryAccountType || approvedTypes[0] || 'pos-only';
  
  // Check if user has active POS subscription
  const posSubscriptionKey = `${accountType}-pos` as keyof typeof subscriptionDetails;
  const hasPosSubscription = subscriptionDetails && subscriptionDetails[posSubscriptionKey];
  
  if (hasPosSubscription) {
    const posExpiryKey = `${accountType}_pos_expires_at` as keyof typeof subscriptionDetails;
    const posExpiry = subscriptionDetails[posExpiryKey];
    
    if (posExpiry && new Date(posExpiry) > new Date()) {
      return { 
        canAccess: true, 
        hasFreeAccess: false,
        hasSubscription: true,
        accountType: accountType
      };
    }
  }

  // All users can subscribe to POS, but pricing varies
  return { 
    canAccess: true, 
    hasFreeAccess: false,
    hasSubscription: false,
    needsSubscription: true,
    hasActiveAccount: hasActiveAccount,
    accountType: hasActiveAccount ? accountType : 'pos-only',
    pricing: hasActiveAccount ? 1500 : 2100 // Add-on vs standalone pricing
  };
}