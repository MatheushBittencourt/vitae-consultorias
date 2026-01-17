interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'light' | 'dark';
  className?: string;
  variant?: 'full' | 'icon'; // full = logo com texto, icon = apenas o V
}

const sizes = {
  sm: { img: 'h-8', text: 'text-lg' },
  md: { img: 'h-10', text: 'text-xl' },
  lg: { img: 'h-14', text: 'text-2xl' },
  xl: { img: 'h-20', text: 'text-3xl' },
};

export function Logo({ size = 'md', showText = true, textColor = 'dark', className = '', variant = 'full' }: LogoProps) {
  const sizeConfig = sizes[size];
  
  // Escolhe a imagem baseado na variante
  const imageSrc = variant === 'icon' 
    ? '/images/v-logo-sozinha-semfundo.png' 
    : '/images/logo-menor-semfundo.png';
  
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={imageSrc} 
        alt="VITAE" 
        className={`${sizeConfig.img} w-auto object-contain`}
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

// Versão apenas do ícone V (sem texto)
export function LogoIcon({ size = 'md', className = '' }: Omit<LogoProps, 'showText' | 'textColor' | 'variant'>) {
  const sizeConfig = sizes[size];
  
  return (
    <img 
      src="/images/v-logo-sozinha-semfundo.png" 
      alt="VITAE" 
      className={`${sizeConfig.img} w-auto object-contain ${className}`}
    />
  );
}
