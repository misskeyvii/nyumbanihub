interface ListerBadgeProps {
  type: string | null | undefined;
  size?: 'sm' | 'md';
}

const configs: Record<string, { icon: string; label: string; classes: string }> = {
  agent: {
    icon: 'ri-user-star-line',
    label: 'Agent',
    classes: 'bg-sky-100 text-sky-700',
  },
  caretaker: {
    icon: 'ri-key-2-line',
    label: 'Caretaker',
    classes: 'bg-violet-100 text-violet-700',
  },
  landlord: {
    icon: 'ri-home-4-line',
    label: 'Landlord',
    classes: 'bg-emerald-100 text-emerald-700',
  },
};

export default function ListerBadge({ type, size = 'sm' }: ListerBadgeProps) {
  if (!type) return null;
  const cfg = configs[type.toLowerCase()];
  if (!cfg) return null;

  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const iconSize = size === 'sm' ? 'text-[11px]' : 'text-xs';
  const py = size === 'sm' ? 'py-0.5 px-1.5' : 'py-1 px-2';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${cfg.classes} ${py} ${textSize}`}>
      <i className={`${cfg.icon} ${iconSize}`}></i>
      {cfg.label}
    </span>
  );
}
