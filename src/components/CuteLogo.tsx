import React from 'react';
import { motion } from 'motion/react';

interface CuteLogoProps {
  type: 'cute-pill' | 'cute-cross' | 'cute-heart' | 'cute-sparkle';
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
  size?: number;
  customUrl?: string; // Custom company logo URL or base64
}

export default function CuteLogo({ type, theme, size = 48, customUrl }: CuteLogoProps) {
  // Gradients based on theme
  const getGradient = () => {
    switch (theme) {
      case 'lavender':
        return { from: '#818cf8', to: '#c084fc', stroke: '#4f46e5' };
      case 'minty':
        return { from: '#34d399', to: '#2dd4bf', stroke: '#059669' };
      case 'ocean':
        return { from: '#38bdf8', to: '#60a5fa', stroke: '#2563eb' };
      case 'sunset':
        return { from: '#f59e0b', to: '#f97316', stroke: '#ea580c' };
      case 'cherry':
        return { from: '#f472b6', to: '#fb7185', stroke: '#db2777' };
      default:
        return { from: '#818cf8', to: '#c084fc', stroke: '#4f46e5' };
    }
  };

  const { from, to, stroke } = getGradient();

  const logoVariants = {
    hover: {
      scale: 1.15,
      rotate: [0, -5, 5, -5, 0],
      transition: { duration: 0.5 }
    }
  };

  if (customUrl) {
    return (
      <motion.div
        variants={logoVariants}
        whileHover="hover"
        className="inline-flex items-center justify-center cursor-pointer"
        style={{ width: size, height: size }}
      >
        <img
          src={customUrl}
          alt="Logo Perusahaan"
          className="w-full h-full object-cover rounded-2xl border border-slate-100 shadow-xs"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={logoVariants}
      whileHover="hover"
      className="inline-flex items-center justify-center cursor-pointer"
      style={{ width: size, height: size }}
    >
      {type === 'cute-pill' && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="pillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={from} />
              <stop offset="50%" stopColor={from} />
              <stop offset="50.1%" stopColor={to} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          </defs>
          {/* Pill Body */}
          <rect x="15" y="30" width="70" height="40" rx="20" fill="url(#pillGrad)" stroke={stroke} strokeWidth="6" />
          {/* Cutest smiley faces */}
          <circle cx="38" cy="46" r="4.5" fill={stroke} />
          <circle cx="62" cy="46" r="4.5" fill={stroke} />
          {/* Smiling Mouth */}
          <path d="M 44 54 Q 50 60 56 54" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" fill="none" />
          {/* Blush */}
          <circle cx="30" cy="53" r="3.5" fill="#f43f5e" opacity="0.6" />
          <circle cx="70" cy="53" r="3.5" fill="#f43f5e" opacity="0.6" />
        </svg>
      )}

      {type === 'cute-cross' && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="crossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={from} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          </defs>
          {/* Soft Rounded Cross */}
          <path
            d="M 35 15 C 35 10, 65 10, 65 15 L 65 35 L 85 35 C 90 35, 90 65, 85 65 L 65 65 L 65 85 C 65 90, 35 90, 35 85 L 35 65 L 15 65 C 10 65, 10 35, 15 35 L 35 35 Z"
            fill="url(#crossGrad)"
            stroke={stroke}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Cute face in center */}
          <circle cx="42" cy="46" r="4" fill="white" />
          <circle cx="58" cy="46" r="4" fill="white" />
          <path d="M 46 54 Q 50 58 54 54" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Sparkles */}
          <path d="M 82 15 L 85 22 L 92 25 L 85 28 L 82 35 L 79 28 L 72 25 L 79 22 Z" fill="#fbbf24" />
        </svg>
      )}

      {type === 'cute-heart' && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={from} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          </defs>
          {/* Cute Heart */}
          <path
            d="M 50 85 C 10 50, 10 20, 50 20 C 90 20, 90 50, 50 85 Z"
            fill="url(#heartGrad)"
            stroke={stroke}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Band-aid bandage */}
          <rect x="25" y="42" width="50" height="15" rx="4" fill="#fed7aa" stroke={stroke} strokeWidth="3" transform="rotate(-15 50 50)" />
          <circle cx="45" cy="47" r="1.5" fill={stroke} />
          <circle cx="55" cy="47" r="1.5" fill={stroke} />
          {/* Cute Face outside bandaid or peek */}
          <circle cx="38" cy="33" r="3.5" fill="white" />
          <circle cx="62" cy="33" r="3.5" fill="white" />
          <path d="M 46 38 Q 50 41 54 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>
      )}

      {type === 'cute-sparkle' && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={from} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          </defs>
          {/* Cute Shield */}
          <path
            d="M 50 15 C 75 15, 85 25, 80 55 C 75 80, 50 90, 50 90 C 50 90, 25 80, 20 55 C 15 25, 25 15, 50 15 Z"
            fill="url(#sparkGrad)"
            stroke={stroke}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Sparkly Eyes */}
          <path d="M 33 40 L 36 45 L 41 45 L 37 49 L 39 54 L 34 50 L 29 54 L 31 49 L 27 45 L 32 45 Z" fill="white" />
          <path d="M 67 40 L 70 45 L 75 45 L 71 49 L 73 54 L 68 50 L 63 54 L 65 49 L 61 45 L 66 45 Z" fill="white" />
          {/* Joy mouth */}
          <path d="M 44 55 Q 50 63 56 55" stroke="white" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          {/* Sparkles outside */}
          <path d="M 12 15 L 15 20 L 20 21 L 15 22 L 12 27 L 9 22 L 4 21 L 9 20 Z" fill="#fbbf24" />
          <path d="M 85 75 L 87 79 L 91 80 L 87 81 L 85 85 L 83 81 L 79 80 L 83 79 Z" fill="#fbbf24" />
        </svg>
      )}
    </motion.div>
  );
}
