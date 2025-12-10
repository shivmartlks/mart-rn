// src/components/ui/Button.js

import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  colors,
  spacing,
  textSizes,
  radius,
  componentTokens,
} from "../../theme";

export default function Button({
  title = null,
  children = null,
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
  const isDisabled = loading || disabled;

  // -----------------------------
  // SIZE MAP (with fallback!)
  // -----------------------------
  const sizeMap = {
    sm: {
      height: 32,
      fontSize: textSizes.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
    },
    md: {
      height: 40,
      fontSize: textSizes.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.md,
    },
    lg: {
      height: 48,
      fontSize: textSizes.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
    },
  };

  // SAFETY: guarantee 's' is never undefined
  const s = sizeMap[size] || sizeMap["md"];

  // -----------------------------
  // VARIANT MAP (with fallback!)
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

  const v = variantMap[variant] || variantMap["primary"];

  // -----------------------------
  // DISABLED STYLES (theme tokens)
  // -----------------------------
  const disabledStyle = isDisabled
    ? {
        backgroundColor: componentTokens.button.disabledBg,
        textColor: componentTokens.button.disabledText,
        borderColor: componentTokens.button.disabledBg,
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

          // SIZE VALUES (safe!)
          minHeight: s.height,
          paddingVertical: s.paddingVertical,

          // BUTTON RADIUS SHOULD MATCH SIZE RADIUS
          borderRadius: s.borderRadius,

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

      {/* LABEL OR CHILDREN */}
      {!loading && (
        <Text
          style={[
            styles.text,
            {
              fontSize: s.fontSize,
              color: txtColor,
            },
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  text: {
    fontWeight: "600",
  },
});
