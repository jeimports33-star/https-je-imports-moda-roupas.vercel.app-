import React from 'react';
import { useStore } from '../context/StoreContext';
import defaultLionLogo from '../assets/je_lion_logo.jpg';

const DEFAULT_LION_LOGO = defaultLionLogo;

interface JeLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  showSubtitle?: boolean;
  textColor?: 'gold' | 'white' | 'dark';
  className?: string;
  customImage?: string | null;
}

export const JeLogo: React.FC<JeLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  textColor = 'gold',
  className = '',
  customImage,
}) => {
  const sizeMap = {
    xs: { iconSize: 'w-6 h-6', textJe: 'text-base', textSub: 'text-[6px]' },
    sm: { iconSize: 'w-8 h-8', textJe: 'text-lg', textSub: 'text-[8px]' },
    md: { iconSize: 'w-10 h-10', textJe: 'text-xl', textSub: 'text-[9px]' },
    lg: { iconSize: 'w-14 h-14', textJe: 'text-3xl', textSub: 'text-[11px]' },
    xl: { iconSize: 'w-20 h-20', textJe: 'text-4xl', textSub: 'text-xs' },
    '2xl': { iconSize: 'w-32 h-32', textJe: 'text-6xl', textSub: 'text-base' },
  };

  const { iconSize, textJe, textSub } = sizeMap[size];

  // Try to read customLogoUrl from StoreContext if available
  let contextLogoUrl: string | null = null;
  try {
    const store = useStore();
    contextLogoUrl = store.customLogoUrl;
  } catch {
    // Outside StoreProvider fallback
  }

  // Use custom image, or context logo, or default luxury lion logo
  const effectiveImage = customImage !== undefined 
    ? customImage 
    : (contextLogoUrl || DEFAULT_LION_LOGO);

  const textClasses = {
    gold: 'text-[#DFBA73]',
    white: 'text-white',
    dark: 'text-neutral-950',
  }[textColor];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Medallion / Image container */}
      <div className={`relative ${iconSize} shrink-0 flex items-center justify-center`}>
        {effectiveImage ? (
          <div className="w-full h-full rounded-full overflow-hidden border border-[#DFBA73]/50 bg-neutral-950 shadow-md ring-1 ring-[#DFBA73]/20 flex items-center justify-center">
            <img 
              src={effectiveImage} 
              alt="Logo JE Imports Leão" 
              className="w-full h-full object-cover object-center scale-[1.05]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_LION_LOGO;
              }}
            />
          </div>
        ) : (
          /* Crowned Lion Crest Fallback */
          <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-sm"
            aria-label="Logo Leão JE Imports"
          >
            <path 
              d="M32 26L38 12L50 20L62 12L68 26L58 24L50 28L42 24L32 26Z" 
              fill="#DFBA73" 
              stroke="#C59B4B" 
              strokeWidth="1.5" 
              strokeLinejoin="round" 
            />
            <circle cx="38" cy="12" r="1.5" fill="#FFF8E7" />
            <circle cx="50" cy="20" r="1.5" fill="#FFF8E7" />
            <circle cx="62" cy="12" r="1.5" fill="#FFF8E7" />
            <path 
              d="M26 38C23 44 24 53 28 60C31 66 36 71 42 74C45 75.5 48 76 50 76C52 76 55 75.5 58 74C64 71 69 66 72 60C76 53 77 44 74 38C71 33 65 30 65 30C65 30 61 32 50 32C39 32 35 30 35 30C35 30 29 33 26 38Z" 
              fill="#DFBA73" 
              stroke="#C59B4B" 
              strokeWidth="1.5" 
              strokeLinejoin="round" 
            />
            <path d="M44 34L50 38L56 34L54 44L50 42L46 44L44 34Z" fill="#0F0F0F" />
            <path d="M39 46C41 44 45 45 46 48C43 49 40 48 39 46Z" fill="#0F0F0F" />
            <path d="M61 46C59 44 55 45 54 48C57 49 60 48 61 46Z" fill="#0F0F0F" />
            <path d="M48 45H52L53 54L50 56L47 54L48 45Z" fill="#0F0F0F" />
            <path d="M47 56H53L50 60L47 56Z" fill="#DFBA73" />
            <path d="M43 56C39 58 40 64 45 64C47 64 49 62 50 60C51 62 53 64 55 64C60 64 61 58 57 56C55 58 52 58 50 58C48 58 45 58 43 56Z" fill="#0F0F0F" />
            <path d="M47 65L50 71L53 65L50 67L47 65Z" fill="#DFBA73" />
          </svg>
        )}
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-black tracking-tight ${textJe} ${textClasses}`}>
            JE
          </span>
          {showSubtitle && (
            <span className={`font-sans font-bold tracking-[0.25em] uppercase ${textSub} opacity-90 ${textClasses}`}>
              IMPORTS
            </span>
          )}
        </div>
      )}
    </div>
  );
};
