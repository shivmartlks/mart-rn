// src/theme/colors.js

// -----------------------------------------------------------------------------
// FULL COLOR PALETTE (future-proof, matches your tone system)
// -----------------------------------------------------------------------------

export const colors = {
  // WHITE (updated to match new screenBG + cardBG hierarchy)
  white50: "#ffffff", // pure bright white → used for cardBG
  white100: "#fdfdfd", // ultra-soft off-white
  white150: "#fafafa", // matches screenBG softness
  white200: "#f1f2f5", // deeper neutral white for subtle surfaces

  // BLACK (Neutral Dark Grays)
  black50: "#f5f5f5",
  black100: "#e8e8e8",
  black200: "#cfcfcf",
  black300: "#a8a8a8",
  black400: "#828282",
  black500: "#5f5f5f",
  black600: "#3d3d3d",
  black700: "#262626",
  black800: "#1a1a1a",
  black900: "#000000",

  // GRAY (UI grayscale system)
  gray50: "#f7f8fa",
  gray100: "#f1f2f4",
  gray200: "#e8e9ec", // border color
  gray300: "#d4d6da",
  gray400: "#b7bcc5",
  gray500: "#9ea4af",
  gray600: "#6a6f7d",
  gray700: "#4f5360",
  gray800: "#2b2e36",
  gray900: "#1b1d28",

  // BLUE (future use)
  blue50: "#eef4ff",
  blue100: "#d9e3ff",
  blue200: "#b3c7ff",
  blue300: "#8eacff",
  blue400: "#5e8cff",
  blue500: "#2c68ff",
  blue600: "#0a3fff",
  blue700: "#082fcc",
  blue800: "#062397",
  blue900: "#041a6c",

  // GREEN
  green50: "#e8f9f2",
  green100: "#d0f2e4",
  green200: "#a4e5cd",
  green300: "#76d9b6",
  green400: "#48cc9f",
  green500: "#27c18f",
  green600: "#1daf80",
  green700: "#168964",
  green800: "#0e6449",
  green900: "#0a4935",

  // RED
  red50: "#fff2f2",
  red100: "#ffdada",
  red200: "#ffb3b3",
  red300: "#ff8a8a",
  red400: "#ff6c6c",
  red500: "#ff4a4a",
  red600: "#e73434",
  red700: "#c62828",
  red800: "#9e1f1f",
  red900: "#741616",

  // ORANGE
  orange50: "#fff6ea",
  orange100: "#ffe9c7",
  orange200: "#ffd595",
  orange300: "#ffbc61",
  orange400: "#ffa637",
  orange500: "#ff9d27",
  orange600: "#e6840e",
  orange700: "#b8650a",
  orange800: "#8e4b07",
  orange900: "#5f3204",

  // SOFT BLUE
  softblue50: "#f4f7ff",
  softblue100: "#e8f0ff",
  softblue200: "#dde8ff",

  // SEMANTIC + APP TOKENS
  primary: "#1a1a1a",
  primaryHover: "#000000",

  success: "#1daf80",
  warning: "#ff9d27",
  danger: "#e73434",

  // FINAL APP SURFACE COLORS (your chosen ones)
  screenBG: "#fafafa", // soft neutral screen background
  cardBG: "#ffffff", // cards must remain brighter than background

  // TEXT
  textPrimary: "#1b1d28",
  textSecondary: "#6a6f7d",
  textMuted: "#9ea4af",

  // UI LINES
  border: "#e8e9ec",
  divider: "#f1f2f4",

  // SHADOW
  shadowBase: "rgba(0,0,0,0.06)",
};
