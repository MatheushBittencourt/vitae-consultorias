import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

const variantClasses = {
  default: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  lime: 'bg-lime-50 text-lime-700 border-lime-200',
};

const dotColors = {
  default: 'bg-zinc-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  lime: 'bg-lime-500',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  dot = false,
  className = '' 
}: BadgeProps) {
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5
        font-semibold rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

// Status Badge específico para estados comuns
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'confirmed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  active: { label: 'Ativo', variant: 'success' as const },
  inactive: { label: 'Inativo', variant: 'default' as const },
  pending: { label: 'Pendente', variant: 'warning' as const },
  confirmed: { label: 'Confirmado', variant: 'lime' as const },
  cancelled: { label: 'Cancelado', variant: 'error' as const },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  );
}

// Notification Badge (para contar notificações)
interface NotificationBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export function NotificationBadge({ count, max = 99, className = '' }: NotificationBadgeProps) {
  if (count === 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span 
      className={`
        inline-flex items-center justify-center
        min-w-[18px] h-[18px] px-1
        bg-red-500 text-white
        text-[10px] font-bold rounded-full
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
}

// Progress Badge (mostra porcentagem)
interface ProgressBadgeProps {
  value: number;
  size?: 'sm' | 'md';
}

export function ProgressBadge({ value, size = 'md' }: ProgressBadgeProps) {
  const variant = value >= 80 ? 'success' : value >= 50 ? 'warning' : 'error';
  
  return (
    <Badge variant={variant} size={size}>
      {value}%
    </Badge>
  );
}
