import { ReactNode } from 'react';
import { 
  Users, 
  Calendar, 
  Dumbbell, 
  Apple, 
  FileText, 
  Search,
  Plus,
  Inbox
} from 'lucide-react';

interface EmptyStateProps {
  icon?: 'users' | 'calendar' | 'training' | 'nutrition' | 'files' | 'search' | 'inbox';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

const icons = {
  users: Users,
  calendar: Calendar,
  training: Dumbbell,
  nutrition: Apple,
  files: FileText,
  search: Search,
  inbox: Inbox,
};

export function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* Decorative circles */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-lime-500/10 rounded-full scale-150 animate-pulse" />
        <div className="absolute inset-0 bg-lime-500/20 rounded-full scale-125" />
        <div className="relative w-20 h-20 bg-lime-500/30 rounded-full flex items-center justify-center">
          <Icon className="w-10 h-10 text-lime-600" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-500 max-w-sm mb-6">{description}</p>

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold 
                     rounded-xl hover:bg-lime-400 transition-all hover:shadow-lg hover:shadow-lime-500/25
                     transform hover:-translate-y-0.5"
        >
          {action.icon || <Plus className="w-5 h-5" />}
          {action.label}
        </button>
      )}
    </div>
  );
}

// Skeleton Loader
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className = '', 
  variant = 'text', 
  width, 
  height 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-zinc-200';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/60 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton className="w-32 mb-2" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-zinc-200/60">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1">
            <Skeleton className="w-40 mb-2" />
            <Skeleton className="w-32 h-3" />
          </div>
          <Skeleton variant="rectangular" width={80} height={28} />
        </div>
      ))}
    </div>
  );
}

// Stat Skeleton
export function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/60 p-6">
      <Skeleton className="w-24 h-3 mb-3" />
      <Skeleton className="w-16 h-8 mb-2" />
      <Skeleton className="w-32 h-3" />
    </div>
  );
}
