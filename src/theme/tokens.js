// src/theme/tokens.js

import { colors } from "./colors";
import { radii } from "./radius";
import { spacing } from "./spacing";
import { textSizes } from "./typography";

export const componentTokens = {
  // ---------------- BUTTONS ----------------
  button: {
    heightMd: 48,
    heightLg: 52,
    radius: radii.lg,

    primaryBg: colors.primary,
    primaryText: colors.white50,

    secondaryBg: colors.white50,
    secondaryText: colors.textPrimary,
    secondaryBorder: colors.gray200,

    disabledBg: colors.gray200,
    disabledText: colors.gray500,
  },

  // ---------------- INPUTS ----------------
  input: {
    bg: colors.white50,
    border: colors.gray200,
    borderFocused: colors.gray400,
    borderError: colors.red400,
    placeholder: colors.textMuted,
    text: colors.textPrimary,
    label: colors.textSecondary,

    radius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  // ---------------- CARDS ----------------
  card: {
    bg: colors.white50,
    border: colors.gray200,
    radius: radii.lg,
    padding: spacing.lg,
  },

  // ---------------- HEADER ----------------
  header: {
    bg: colors.cardBG,
    height: 56,
    titleSize: textSizes.lg,
    titleColor: colors.textPrimary,
    borderBottom: colors.divider,
  },

  // ---------------- SHEET ----------------
  sheet: {
    bg: colors.cardBG,
    radiusTop: radii.xl,
    padding: spacing.xxl,
  },
};
