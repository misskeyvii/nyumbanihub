export function parseSubscriptionDetails(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

export function getSubscriptionExpiry(
  details: Record<string, unknown> | null,
  accountType: string,
  fallback?: string | null
): string | null {
  const entry = details?.[accountType];
  if (typeof entry === 'string') return entry;
  if (entry && typeof entry === 'object' && 'expires_at' in entry) {
    const expiresAt = (entry as { expires_at?: string }).expires_at;
    if (expiresAt) return expiresAt;
  }
  return fallback ?? null;
}

/** Authoritative account types — only what is on the users row, not stale subscription/request data. */
export function getOwnedAccountTypes(accountType: string, extraAccountTypes: string[]): string[] {
  return Array.from(new Set([accountType, ...extraAccountTypes].filter(Boolean)));
}

export function getActiveAccountTypes(
  accountType: string,
  extraAccountTypes: string[],
  details: Record<string, unknown> | null,
  subscriptionExpiresAt: string | null
): string[] {
  const ownedTypes = getOwnedAccountTypes(accountType, extraAccountTypes);

  return ownedTypes.filter(at => {
    const expiry = getSubscriptionExpiry(
      details,
      at,
      at === accountType ? subscriptionExpiresAt : null
    );
    if (!expiry) return true;
    return new Date(expiry) >= new Date();
  });
}

export const listingTypeToAccountType: Record<string, string> = {
  home: 'landlord',
  apartment: 'landlord',
  airbnb: 'airbnb',
  hotel: 'hotel',
  shop: 'shop',
  marketplace: 'marketplace',
};

export const accountTypeToListingTypes: Record<string, string[]> = {
  landlord: ['home', 'apartment'],
  airbnb: ['airbnb'],
  hotel: ['hotel'],
  shop: ['shop'],
  marketplace: ['marketplace'],
};

export function canPostListingType(
  listingType: string,
  accountType: string,
  extraAccountTypes: string[],
  details: Record<string, unknown> | null,
  subscriptionExpiresAt: string | null
): boolean {
  const requiredAccountType = listingTypeToAccountType[listingType];
  if (!requiredAccountType) return false;
  const activeTypes = getActiveAccountTypes(accountType, extraAccountTypes, details, subscriptionExpiresAt);
  return activeTypes.includes(requiredAccountType);
}
