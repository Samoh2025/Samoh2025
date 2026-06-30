/** Design tokens for the One Horizon Homes admin app — black & white brand. */
export const theme = {
  color: {
    // Brand (monochrome)
    primary: '#0A0A0A', // black
    primaryDark: '#000000',
    primarySoft: '#2A2A2A',
    accent: '#0A0A0A', // black
    accentSoft: '#ECECEC', // light gray

    // Surfaces
    bg: '#FFFFFF',
    card: '#FFFFFF',
    sidebar: '#0A0A0A',
    sidebarActive: '#262626',

    // Text
    text: '#0A0A0A',
    textOnDark: '#FFFFFF',
    muted: '#6B6B6B',
    mutedOnDark: '#B7B7B7',

    // Lines
    border: '#E4E4E4',
    borderDark: '#2A2A2A',

    // Status (monochrome — distinguished by fill vs. outline, not hue)
    success: '#0A0A0A',
    successSoft: '#ECECEC',
    warning: '#3A3A3A',
    warningSoft: '#EFEFEF',
    danger: '#0A0A0A',
    dangerSoft: '#F4F4F4',
    info: '#3A3A3A',
    infoSoft: '#F0F0F0',
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 },
  space: (n: number) => n * 4,
  shadow: {
    card: {
      shadowColor: '#000000',
      shadowOpacity: 0.06,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
  },
  font: {
    h1: 30,
    h2: 22,
    h3: 18,
    body: 15,
    small: 13,
    tiny: 11,
  },
} as const;

export type Theme = typeof theme;
