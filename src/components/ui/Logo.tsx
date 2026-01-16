interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'light' | 'dark';
  className?: string;
}

const sizes = {
  sm: { img: 'h-8', text: 'text-lg' },
  md: { img: 'h-10', text: 'text-xl' },
  lg: { img: 'h-12', text: 'text-2xl' },
  xl: { img: 'h-16', text: 'text-3xl' },
};

export function Logo({ size = 'md', showText = true, textColor = 'dark', className = '' }: LogoProps) {
  const sizeConfig = sizes[size];
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Logo image - usando scale para compensar a margem branca da imagem */}
      <img 
        src="/images/logo-vitae.png" 
        alt="VITAE" 
        className={`${sizeConfig.img} w-auto object-contain scale-150`}
        style={{ marginLeft: '-0.5rem', marginRight: '-0.25rem' }}
      />
      {showText && (
        <span className={`${sizeConfig.text} font-bold tracking-tighter ${
          textColor === 'light' ? 'text-white' : 'text-black'
        }`}>
          VITAE
        </span>
      )}
    </div>
  );
}

// Versão apenas do ícone (sem texto)
export function LogoIcon({ size = 'md', className = '' }: Omit<LogoProps, 'showText' | 'textColor'>) {
  const sizeConfig = sizes[size];
  
  return (
    <img 
      src="/images/logo-vitae.png" 
      alt="VITAE" 
      className={`${sizeConfig.img} w-auto object-contain scale-150 ${className}`}
      style={{ marginLeft: '-0.5rem', marginRight: '-0.5rem' }}
    />
  );
}
