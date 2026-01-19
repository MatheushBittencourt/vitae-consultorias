import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'md',
  onClick 
}: CardProps) {
  const baseClasses = `
    bg-white rounded-2xl border border-zinc-200/60 
    shadow-sm shadow-zinc-200/50
    transition-all duration-200
  `;
  
  const hoverClasses = hover || onClick ? `
    hover:shadow-md hover:shadow-zinc-200/80 
    hover:border-zinc-300/80 
    hover:-translate-y-0.5
    cursor-pointer
  ` : '';

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

// Card Header
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-bold text-zinc-900">{title}</h3>
          {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// Stat Card
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; positive: boolean };
  color?: 'lime' | 'blue' | 'purple' | 'orange' | 'red' | 'zinc';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  lime: {
    bg: 'bg-lime-50',
    icon: 'bg-lime-500 text-black',
    accent: 'text-lime-600',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500 text-white',
    accent: 'text-blue-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-500 text-white',
    accent: 'text-purple-600',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-500 text-white',
    accent: 'text-orange-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-500 text-white',
    accent: 'text-red-600',
  },
  zinc: {
    bg: 'bg-zinc-50',
    icon: 'bg-zinc-700 text-white',
    accent: 'text-zinc-600',
  },
};

const sizeClasses = {
  sm: { value: 'text-2xl', label: 'text-xs', icon: 'w-8 h-8', iconInner: 'w-4 h-4' },
  md: { value: 'text-3xl', label: 'text-sm', icon: 'w-10 h-10', iconInner: 'w-5 h-5' },
  lg: { value: 'text-4xl', label: 'text-base', icon: 'w-12 h-12', iconInner: 'w-6 h-6' },
};

export function StatCard({ 
  label, 
  value, 
  icon, 
  trend, 
  color = 'zinc',
  size = 'md' 
}: StatCardProps) {
  const colors = colorClasses[color];
  const sizes = sizeClasses[size];

  return (
    <Card className={`${colors.bg} border-0`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`${sizes.label} font-medium text-zinc-500 uppercase tracking-wider mb-2`}>
            {label}
          </p>
          <p className={`${sizes.value} font-bold text-zinc-900`}>{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-zinc-400 ml-1">vs. mês anterior</span>
            </p>
          )}
        </div>
        {icon && (
          <div className={`${sizes.icon} rounded-xl ${colors.icon} flex items-center justify-center`}>
            <div className={sizes.iconInner}>{icon}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
