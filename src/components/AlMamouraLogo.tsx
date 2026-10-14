import React from 'react';

interface AlMamouraLogoProps {
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
  showJuryLabel?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AlMamouraLogo: React.FC<AlMamouraLogoProps> = ({
  variant = 'light',
  className = '',
  showJuryLabel = true,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { width: 112, height: 62 },
    md: { width: 160, height: 88 },
    lg: { width: 220, height: 120 },
    xl: { width: 300, height: 164 },
  };

  const dimensions = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src="/almamoura-logo.png"
        alt="Al Mamoura International Film Festival"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 object-contain ${variant === 'dark' ? 'rounded bg-white p-1' : ''}`}
      />
      {showJuryLabel && (
        <span className="text-[10px] tracking-widest text-[#9E7A2A] font-semibold border border-[#9E7A2A]/40 px-1.5 py-0.5 rounded font-mono bg-[#9E7A2A]/5">
          SHORT FILM JURY
        </span>
      )}
    </div>
  );
};
