// theme.js

export const radius = {
  base: 0.65 * 16, // React Native uses px, so convert rem → px (0.65rem ≈ 10.4px)
};

// -------------------------------
// TYPOGRAPHY
// -------------------------------
export const textSizes = {
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  16: 16,
  18: 18,
  20: 20,
  24: 24,
  30: 30,
};

// -------------------------------
// COLOR SYSTEM (converted from CSS vars)
// -------------------------------
export const colors = {
  // WHITE
  white50: "#ffffff",
  white100: "#fafbff",
  white150: "#f7f8fa",
  white200: "#f1f2f5",

  // BLACK
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

  // GRAY
  gray50: "#f7f8fa",
  gray100: "#f1f2f4",
  gray200: "#e8e9ec",
  gray300: "#d4d6da",
  gray400: "#b7bcc5",
  gray500: "#9ea4af",
  gray600: "#6a6f7d",
  gray700: "#4f5360",
  gray800: "#2b2e36",
  gray900: "#1b1d28",

  // BLUE
  blue50: "#eef4ff",
  blue100: "#d9e3ff",
  blue200: "#b3c7ff",
  blue300: "#8eacff",
  blue400: "#5e8cff",
  blue500: "#2c68ff",
  blue600: "#0a3fff", // primary
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
  green600: "#1daf80", // success
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
  red600: "#e73434", // error
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

  // SEMANTIC
  primary: "#1a1a1a",
  primaryHover: "#000000",
  primaryLight: "#3d3d3d",

  bg: "#f7f8fa",
  card: "#ffffff",
  border: "#e8e9ec",

  textPrimary: "#1b1d28",
  textSecondary: "#6a6f7d",
  textMuted: "#9ea4af",

  success: "#1daf80",
  warning: "#ff9d27",
  danger: "#e73434",
};

// -------------------------------
// GRADIENTS (React Native format)
// -------------------------------
// Note: Instead of CSS gradients, React Native uses array values for LinearGradient
// (requires expo-linear-gradient or react-native-linear-gradient)
export const gradients = {
  soft: ["#e8f0ff", "#ffffff"],

  blue: ["#d9e3ff", "#8eacff"],
  blueStrong: ["#5e8cff", "#0a3fff"],
  blueInverse: ["#0a3fff", "#5e8cff"],

  success: ["#a4e5cd", "#27c18f"],
  successSoft: ["#e8f9f2", "#a4e5cd"],

  warning: ["#ffd595", "#ff9d27"],
  warningSoft: ["#fff6ea", "#ffd595"],

  danger: ["#ffb3b3", "#e73434"],
  dangerSoft: ["#fff2f2", "#ffb3b3"],
};

// -------------------------------
// SHADOWS
// -------------------------------
export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHover: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  primary: {
    shadowColor: "rgba(10,63,255,0.25)",
    shadowOpacity: 1,
    elevation: 10,
  },
  success: {
    shadowColor: "rgba(29,175,128,0.25)",
    shadowOpacity: 1,
    elevation: 10,
  },
  warning: {
    shadowColor: "rgba(255,157,39,0.25)",
    shadowOpacity: 1,
    elevation: 10,
  },
};
