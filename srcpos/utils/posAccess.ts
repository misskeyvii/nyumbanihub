// POS access eligibility checker for POS system
export function checkPosEligibility(
  primaryAccountType: string,
  approvedTypes: string[],
  subscriptionExpiresAt: string | null,
  subscriptionDetails: any
) {
  // All account types can access POS if they have active subscription
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
        accountType: accountType,
        reason: null
      };
    } else {
      return {
        canAccess: false,
        accountType: accountType,
        reason: 'POS subscription has expired. Please renew your subscription.'
      };
    }
  }

  // Check if they have pos-only subscription
  if (subscriptionDetails && subscriptionDetails['pos-only']) {
    const posOnlyExpiry = subscriptionDetails['pos_only_expires_at'];
    if (posOnlyExpiry && new Date(posOnlyExpiry) > new Date()) {
      return { 
        canAccess: true, 
        accountType: 'pos-only',
        reason: null
      };
    }
  }

  return {
    canAccess: false,
    accountType: accountType,
    reason: 'No active POS subscription found. Please subscribe to POS access in your Nyumbani Link profile.'
  };
}