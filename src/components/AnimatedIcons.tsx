import React from 'react';

export interface AnimatedIconProps {
  className?: string;
  active?: boolean;
}

/**
 * Biblioteca de Ícones Animados (inspirados na referência de UX `icones.mp4`)
 * Traços vetoriais refinados com micro-animações de desenho (stroke-dashoffset),
 * rotação elástica e pulso suave em interações/estado ativo.
 */

export const AnimatedBookOpenIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path
      d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
      className="ux-stroke-draw ux-wing-left"
    />
    <path
      d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
      className="ux-stroke-draw ux-wing-right"
    />
  </svg>
);

export const AnimatedClockHistoryIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" className="ux-stroke-draw" />
    <path d="M3 3v5h5" className="ux-stroke-draw" />
    <path d="M12 7v5l3.5 2" className="ux-clock-hand" />
  </svg>
);

export const AnimatedHeartIcon: React.FC<AnimatedIconProps & { filled?: boolean }> = ({
  className = 'w-5 h-5',
  active = false,
  filled = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ux-heart-beat ${active || filled ? 'ux-icon-active' : ''} ${className}`}
  >
    <path
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      className="ux-stroke-draw"
    />
  </svg>
);

export const AnimatedBookmarkDiaryIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" className="ux-stroke-draw" />
    <path d="M9 2v8l2.5-2 2.5 2V2" className="ux-bookmark-ribbon" />
  </svg>
);

export const AnimatedSettingsIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ux-gear-spin ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path
      d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      className="ux-stroke-draw"
    />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const AnimatedBellIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ux-bell-ring ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" className="ux-stroke-draw" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const AnimatedShieldCheckIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path
      d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
      className="ux-stroke-draw"
    />
    <path d="m9 12 2 2 4-4" className="ux-check-draw" />
  </svg>
);

export const AnimatedImageWallpaperIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <rect width="18" height="18" x="3" y="3" rx="3" ry="3" className="ux-stroke-draw" />
    <circle cx="9" cy="9" r="2" className="ux-sun-pulse" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" className="ux-check-draw" />
  </svg>
);

export const AnimatedHeadphonesIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ux-headphones-bounce ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path
      d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"
      className="ux-stroke-draw"
    />
  </svg>
);

export const AnimatedSendIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ux-send-fly ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path d="m22 2-7 20-4-9-9-4Z" className="ux-stroke-draw" />
    <path d="M22 2 11 13" className="ux-check-draw" />
  </svg>
);

export const AnimatedSunIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ux-gear-spin ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

export const AnimatedMoonIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ux-moon-tilt ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" className="ux-stroke-draw" />
  </svg>
);

export const AnimatedHelpCircleIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <circle cx="12" cy="12" r="10" className="ux-stroke-draw" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" className="ux-check-draw" />
    <path d="M12 17h.01" />
  </svg>
);

export const AnimatedUserIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" className="ux-stroke-draw" />
    <circle cx="12" cy="7" r="4" className="ux-sun-pulse" />
  </svg>
);

export const AnimatedTypeIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <polyline points="4 7 4 4 20 4 20 7" className="ux-stroke-draw" />
    <line x1="9" x2="15" y1="20" y2="20" className="ux-check-draw" />
    <line x1="12" x2="12" y1="4" y2="20" className="ux-stroke-draw" />
  </svg>
);

export const AnimatedUploadGalleryIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" className="ux-stroke-draw" />
    <polyline points="17 8 12 3 7 8" className="ux-upload-arrow" />
    <line x1="12" x2="12" y1="3" y2="15" className="ux-upload-arrow" />
  </svg>
);

export const AnimatedCheckCircleIcon: React.FC<AnimatedIconProps> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ux-anim-icon ${active ? 'ux-icon-active' : ''} ${className}`}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" className="ux-stroke-draw" />
    <path d="m9 11 3 3L22 4" className="ux-check-draw" />
  </svg>
);
