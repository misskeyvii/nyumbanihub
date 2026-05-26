interface VerifiedBadgeProps {
  type?: 'verified' | 'inspected' | 'shop';
  size?: 'sm' | 'md';
}

export default function VerifiedBadge({ type = 'verified', size = 'sm' }: VerifiedBadgeProps) {
  const configs = {
    verified: {
      icon: 'ri-shield-check-fill',
      label: 'Verified',
      classes: 'bg-emerald-500 text-white',
    },
    inspected: {
      icon: 'ri-eye-line',
      label: 'Inspected by Nyumbani Hub',
      classes: 'bg-emerald-700 text-white',
    },
    shop: {
      icon: 'ri-store-2-fill',
      label: 'Verified Shop',
      classes: 'bg-amber-500 text-white',
    },
  };

  const cfg = configs[type];
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const iconSize = size === 'sm' ? 'text-[11px]' : 'text-xs';
  const py = size === 'sm' ? 'py-0.5 px-1.5' : 'py-1 px-2';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${cfg.classes} ${py} ${textSize} whitespace-nowrap`}>
      <span className={`w-3 h-3 flex items-center justify-center`}>
        <i className={`${cfg.icon} ${iconSize}`}></i>
      </span>
      {cfg.label}
    </span>
  );
}
