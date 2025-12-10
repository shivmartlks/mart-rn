// src/components/ui/Button.js

import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { colors, spacing, textSizes, radius } from "../../theme";

export default function Button({
  title = null, // optional if using children
  children = null, // supports custom JSX
  onPress,
  size = "md", // sm | md | lg
  variant = "primary", // primary | secondary | ghost | link
  block = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  style = {},
  textStyle = {},
  ...props
}) {
  const isDisabled = disabled || loading;

  // -----------------------------
  // SIZE MAP
  // -----------------------------
  const sizeMap = {
    sm: {
      height: 40,
      fontSize: textSizes.sm,
      paddingVertical: spacing.xs,
    },
    md: {
      height: 48,
      fontSize: textSizes.md,
      paddingVertical: spacing.sm,
    },
    lg: {
      height: 56,
      fontSize: textSizes.lg,
      paddingVertical: spacing.md,
    },
  };

  const s = sizeMap[size];

  // -----------------------------
  // VARIANT MAP
  // -----------------------------
  const variantMap = {
    primary: {
      backgroundColor: colors.primary,
      textColor: colors.white50,
      borderColor: "transparent",
    },
    secondary: {
      backgroundColor: colors.cardBG,
      textColor: colors.textPrimary,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: "transparent",
      textColor: colors.textPrimary,
      borderColor: "transparent",
    },
    link: {
      backgroundColor: "transparent",
      textColor: colors.blue600,
      borderColor: "transparent",
    },
  };

  const v = variantMap[variant];

  // -----------------------------
  // DISABLED STATE
  // -----------------------------
  const disabledStyle = isDisabled
    ? {
        backgroundColor: colors.gray200,
        textColor: colors.textMuted,
        borderColor: colors.gray200,
      }
    : {};

  const bg = disabledStyle.backgroundColor || v.backgroundColor;
  const border = disabledStyle.borderColor || v.borderColor;
  const txtColor = disabledStyle.textColor || v.textColor;

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: border === "transparent" ? 0 : 1,
          minHeight: s.height,
          paddingVertical: s.paddingVertical,
          width: block ? "100%" : undefined,
        },
        style,
      ]}
      {...props}
    >
      {/* LEFT ICON */}
      {!loading && leftIcon && (
        <View style={{ marginRight: spacing.xs }}>{leftIcon}</View>
      )}

      {/* TITLE / CHILDREN */}
      {!loading && (
        <Text
          style={[
            styles.text,
            { fontSize: s.fontSize, color: txtColor },
            textStyle,
          ]}
        >
          {children || title}
        </Text>
      )}

      {/* LOADING SPINNER */}
      {loading && (
        <ActivityIndicator
          size="small"
          color={txtColor}
          style={{ marginRight: spacing.xs }}
        />
      )}

      {/* RIGHT ICON */}
      {!loading && rightIcon && (
        <View style={{ marginLeft: spacing.xs }}>{rightIcon}</View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  text: {
    fontWeight: "600",
  },
});
