/** Design tokens for the One Horizon Homes admin app. */
export const theme = {
  color: {
    // Brand
    primary: '#14304A', // deep navy
    primaryDark: '#0D2236',
    primarySoft: '#21456A',
    accent: '#E0A52E', // warm amber
    accentSoft: '#F6E2B3',

    // Surfaces
    bg: '#F3F5F8',
    card: '#FFFFFF',
    sidebar: '#0F2A43',
    sidebarActive: '#1C4368',

    // Text
    text: '#15212E',
    textOnDark: '#EAF1F8',
    muted: '#6B7C8E',
    mutedOnDark: '#9FB4C9',

    // Lines
    border: '#E3E9EF',
    borderDark: '#1C3A57',

    // Status
    success: '#1F9D6B',
    successSoft: '#DDF3E9',
    warning: '#E0A52E',
    warningSoft: '#FBEDCF',
    danger: '#D6453E',
    dangerSoft: '#FBE2E1',
    info: '#2D7FB8',
    infoSoft: '#DCEDF8',
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 },
  space: (n: number) => n * 4,
  shadow: {
    card: {
      shadowColor: '#0B1F33',
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
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
