import { ReactNode } from 'react';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

// Gera cor consistente baseada no nome
function stringToColor(str: string): string {
  const colors = [
    'bg-lime-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-amber-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// Pega iniciais do nome
function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const sizeClasses = {
  xs: { container: 'w-6 h-6', text: 'text-xs', status: 'w-2 h-2 border' },
  sm: { container: 'w-8 h-8', text: 'text-sm', status: 'w-2.5 h-2.5 border-2' },
  md: { container: 'w-10 h-10', text: 'text-base', status: 'w-3 h-3 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-lg', status: 'w-3.5 h-3.5 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-xl', status: 'w-4 h-4 border-2' },
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-zinc-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

export function Avatar({ 
  src, 
  name, 
  size = 'md', 
  className = '',
  showStatus = false,
  status = 'online'
}: AvatarProps) {
  const sizes = sizeClasses[size];
  const bgColor = stringToColor(name);
  const initials = getInitials(name);

  return (
    <div className={`relative inline-flex ${className}`}>
      <div 
        className={`
          ${sizes.container} rounded-full overflow-hidden
          flex items-center justify-center
          ${src ? '' : `${bgColor} text-white`}
          font-bold ${sizes.text}
          ring-2 ring-white shadow-sm
        `}
      >
        {src ? (
          <img 
            src={src} 
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.classList.add(bgColor, 'text-white');
                parent.textContent = initials;
              }
            }}
          />
        ) : (
          initials
        )}
      </div>
      
      {showStatus && (
        <span 
          className={`
            absolute bottom-0 right-0 
            ${sizes.status} rounded-full 
            ${statusColors[status]}
            border-white
          `}
        />
      )}
    </div>
  );
}

// Avatar Group (para mostrar múltiplos avatares empilhados)
interface AvatarGroupProps {
  users: { name: string; src?: string }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ users, max = 4, size = 'md' }: AvatarGroupProps) {
  const displayed = users.slice(0, max);
  const remaining = users.length - max;
  const sizes = sizeClasses[size];

  return (
    <div className="flex -space-x-2">
      {displayed.map((user, index) => (
        <Avatar
          key={index}
          name={user.name}
          src={user.src}
          size={size}
          className="hover:-translate-y-1 transition-transform"
        />
      ))}
      {remaining > 0 && (
        <div 
          className={`
            ${sizes.container} rounded-full 
            bg-zinc-200 text-zinc-600
            flex items-center justify-center
            font-bold ${sizes.text}
            ring-2 ring-white
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
