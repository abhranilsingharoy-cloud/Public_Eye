import React from 'react';

export interface LogoConfig {
  theme: 'amber' | 'toxic' | 'cobalt' | 'crimson' | 'onyx';
  shape: 'diamond' | 'circle' | 'hexagon' | 'shield' | 'triangle';
  icon: 'p' | 'eye' | 'shield' | 'grid' | 'hazard';
  strokeWidth: number;
  rotation: number;
  scale: number;
  animation: 'pulse' | 'spin' | 'ping' | 'breath' | 'none';
}

interface InteractiveLogoProps {
  config: LogoConfig;
  className?: string;
  size?: number; // width and height in px
}

export default function InteractiveLogo({ config, className = '', size = 32 }: InteractiveLogoProps) {
  const { theme, shape, icon, strokeWidth, rotation, scale, animation } = config;

  // Colors mapping based on theme
  const getThemeColors = () => {
    switch (theme) {
      case 'toxic':
        return {
          primary: '#22c55e', // Emerald 500
          secondary: '#4ade80',
          bg: 'rgba(34, 197, 94, 0.1)',
          border: 'rgba(34, 197, 94, 0.3)',
          text: '#4ade80',
        };
      case 'cobalt':
        return {
          primary: '#3b82f6', // Blue 500
          secondary: '#60a5fa',
          bg: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.3)',
          text: '#60a5fa',
        };
      case 'crimson':
        return {
          primary: '#ef4444', // Red 500
          secondary: '#f87171',
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.3)',
          text: '#f87171',
        };
      case 'onyx':
        return {
          primary: '#e2e8f0', // Slate 200
          secondary: '#94a3b8',
          bg: 'rgba(226, 232, 240, 0.05)',
          border: 'rgba(226, 232, 240, 0.2)',
          text: '#ffffff',
        };
      case 'amber':
      default:
        return {
          primary: '#f59e0b', // Amber 500
          secondary: '#fbbf24',
          bg: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.3)',
          text: '#fbbf24',
        };
    }
  };

  const colors = getThemeColors();

  // Outer container path/shape
  const renderShapePath = () => {
    switch (shape) {
      case 'circle':
        return <circle cx="50" cy="50" r="42" fill={colors.bg} stroke={colors.primary} strokeWidth={strokeWidth} />;
      case 'hexagon':
        return (
          <path
            d="M 50 8 L 86 29 L 86 71 L 50 92 L 14 71 L 14 29 Z"
            fill={colors.bg}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
          />
        );
      case 'shield':
        return (
          <path
            d="M 16 14 L 84 14 L 84 50 C 84 74 50 92 50 92 C 50 92 16 74 16 50 Z"
            fill={colors.bg}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
          />
        );
      case 'triangle':
        return (
          <path
            d="M 50 10 L 90 85 L 10 85 Z"
            fill={colors.bg}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
          />
        );
      case 'diamond':
      default:
        return (
          <path
            d="M 50 10 L 90 50 L 50 90 L 10 50 Z"
            fill={colors.bg}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
          />
        );
    }
  };

  // Center icon inside logo
  const renderInnerIcon = () => {
    const iconColor = colors.text;
    switch (icon) {
      case 'eye':
        return (
          <g transform="translate(18, 18) scale(0.64)">
            {/* Eye Contour */}
            <path
              d="M 5 50 C 25 15 75 15 95 50 C 75 85 25 85 5 50 Z"
              fill="none"
              stroke={iconColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Pupil */}
            <circle cx="50" cy="50" r="16" fill="none" stroke={iconColor} strokeWidth="5" />
            <circle cx="50" cy="50" r="7" fill={iconColor} />
          </g>
        );
      case 'shield':
        return (
          <g transform="translate(25, 22) scale(0.5)">
            <path
              d="M 12 22 C 12 22 12 12 50 12 C 88 12 88 22 88 22 C 88 62 50 88 50 88 C 50 88 12 62 12 22 Z"
              fill="none"
              stroke={iconColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M 50 12 L 50 88" stroke={iconColor} strokeWidth="6" />
          </g>
        );
      case 'grid':
        return (
          <g transform="translate(26, 26) scale(0.48)">
            {/* 2x2 grid representing district ledger */}
            <rect x="10" y="10" width="34" height="34" fill="none" stroke={iconColor} strokeWidth="6" rx="4" />
            <rect x="56" y="10" width="34" height="34" fill="none" stroke={iconColor} strokeWidth="6" rx="4" />
            <rect x="10" y="56" width="34" height="34" fill="none" stroke={iconColor} strokeWidth="6" rx="4" />
            <rect x="56" y="56" width="34" height="34" fill="none" stroke={iconColor} strokeWidth="6" rx="4" />
          </g>
        );
      case 'hazard':
        return (
          <g transform="translate(24, 22) scale(0.52)">
            {/* Warning sign */}
            <path
              d="M 50 10 L 90 82 L 10 82 Z"
              fill="none"
              stroke={iconColor}
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <line x1="50" y1="36" x2="50" y2="56" stroke={iconColor} strokeWidth="7" strokeLinecap="round" />
            <circle cx="50" cy="70" r="4.5" fill={iconColor} />
          </g>
        );
      case 'p':
      default:
        // Adjust letter positioning based on shape for ideal balance
        const yOffset = shape === 'triangle' ? 57 : 54;
        const xOffset = shape === 'shield' ? 51 : 50;
        return (
          <text
            x={xOffset}
            y={yOffset}
            fill={colors.text}
            fontSize="32"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="monospace, system-ui"
          >
            P
          </text>
        );
    }
  };

  // Determine animation classes/attributes
  const getAnimationStyles = (): React.CSSProperties => {
    switch (animation) {
      case 'spin':
        return {
          transformOrigin: 'center',
          animation: 'spin 12s linear infinite',
        };
      case 'pulse':
        return {
          transformOrigin: 'center',
          animation: 'pulse-slow 2.5s ease-in-out infinite',
        };
      case 'ping':
        return {
          transformOrigin: 'center',
          animation: 'ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        };
      case 'breath':
        return {
          transformOrigin: 'center',
          animation: 'breath 4s ease-in-out infinite',
        };
      case 'none':
      default:
        return {};
    }
  };

  // SVG inline styles to support custom animation routines
  const rotationStyle = rotation !== 0 ? { transform: `rotate(${rotation}deg)`, transformOrigin: 'center' } : {};
  const scaleStyle = scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: 'center' } : {};

  const combinedStyles: React.CSSProperties = {
    ...getAnimationStyles(),
    ...rotationStyle,
    ...scaleStyle,
  };

  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Styles Injection for Custom Keyframe Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(0.94); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          70%, 100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes breath {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 1px ${colors.primary}); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 8px ${colors.primary}); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={combinedStyles}
      >
        {renderShapePath()}
        {renderInnerIcon()}
      </svg>
    </div>
  );
}

// Helper to generate the exact XML raw code for copying/exporting
export function generateSvgCode(config: LogoConfig): string {
  const { theme, shape, icon, strokeWidth, rotation } = config;

  // Colors
  const colors = {
    toxic: { primary: '#22c55e', text: '#4ade80', bg: 'rgba(34, 197, 94, 0.1)' },
    cobalt: { primary: '#3b82f6', text: '#60a5fa', bg: 'rgba(59, 130, 246, 0.1)' },
    crimson: { primary: '#ef4444', text: '#f87171', bg: 'rgba(239, 68, 68, 0.1)' },
    onyx: { primary: '#e2e8f0', text: '#ffffff', bg: 'rgba(226, 232, 240, 0.05)' },
    amber: { primary: '#f59e0b', text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)' },
  }[theme];

  const outerShape = {
    circle: `<circle cx="50" cy="50" r="42" fill="${colors.bg}" stroke="${colors.primary}" stroke-width="${strokeWidth}" />`,
    hexagon: `<path d="M 50 8 L 86 29 L 86 71 L 50 92 L 14 71 L 14 29 Z" fill="${colors.bg}" stroke="${colors.primary}" stroke-width="${strokeWidth}" />`,
    shield: `<path d="M 16 14 L 84 14 L 84 50 C 84 74 50 92 50 92 C 50 92 16 74 16 50 Z" fill="${colors.bg}" stroke="${colors.primary}" stroke-width="${strokeWidth}" />`,
    triangle: `<path d="M 50 10 L 90 85 L 10 85 Z" fill="${colors.bg}" stroke="${colors.primary}" stroke-width="${strokeWidth}" />`,
    diamond: `<path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" fill="${colors.bg}" stroke="${colors.primary}" stroke-width="${strokeWidth}" />`,
  }[shape];

  const innerIcon = {
    eye: `  <g transform="translate(18, 18) scale(0.64)">
    <path d="M 5 50 C 25 15 75 15 95 50 C 75 85 25 85 5 50 Z" fill="none" stroke="${colors.text}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="50" cy="50" r="16" fill="none" stroke="${colors.text}" stroke-width="5" />
    <circle cx="50" cy="50" r="7" fill="${colors.text}" />
  </g>`,
    shield: `  <g transform="translate(25, 22) scale(0.5)">
    <path d="M 12 22 C 12 22 12 12 50 12 C 88 12 88 22 88 22 C 88 62 50 88 50 88 C 50 88 12 62 12 22 Z" fill="none" stroke="${colors.text}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 50 12 L 50 88" stroke="${colors.text}" stroke-width="6" />
  </g>`,
    grid: `  <g transform="translate(26, 26) scale(0.48)">
    <rect x="10" y="10" width="34" height="34" fill="none" stroke="${colors.text}" stroke-width="6" rx="4" />
    <rect x="56" y="10" width="34" height="34" fill="none" stroke="${colors.text}" stroke-width="6" rx="4" />
    <rect x="10" y="56" width="34" height="34" fill="none" stroke="${colors.text}" stroke-width="6" rx="4" />
    <rect x="56" y="56" width="34" height="34" fill="none" stroke="${colors.text}" stroke-width="6" rx="4" />
  </g>`,
    hazard: `  <g transform="translate(24, 22) scale(0.52)">
    <path d="M 50 10 L 90 82 L 10 82 Z" fill="none" stroke="${colors.text}" stroke-width="6" stroke-linejoin="round" />
    <line x1="50" y1="36" x2="50" y2="56" stroke="${colors.text}" stroke-width="7" stroke-linecap="round" />
    <circle cx="50" cy="70" r="4.5" fill="${colors.text}" />
  </g>`,
    p: `  <text x="${shape === 'shield' ? 51 : 50}" y="${shape === 'triangle' ? 57 : 54}" fill="${colors.text}" font-size="32" font-weight="900" text-anchor="middle" font-family="monospace, system-ui">P</text>`,
  }[icon];

  const rotationAttr = rotation !== 0 ? ` transform="rotate(${rotation} 50 50)"` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <g${rotationAttr}>
    ${outerShape}
    ${innerIcon}
  </g>
</svg>`;
}
