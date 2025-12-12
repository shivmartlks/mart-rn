// src/components/ui/Badge.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fontWeights, radii, textSizes } from "../../theme";

export default function Badge({
  label,
  variant = "neutral", // success | warning | danger | info | neutral
  size = "md", // sm | md
  icon = null, // optional left icon
  style = {},
  textStyle = {},
}) {
  const stylesVariant = variantStyles[variant] || variantStyles.neutral;
  const sizeVariant = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: stylesVariant.bg,
          borderColor: stylesVariant.border,
          paddingVertical: sizeVariant.paddingVertical,
          paddingHorizontal: sizeVariant.paddingHorizontal,
          borderRadius: sizeVariant.radius,
        },
        style,
      ]}
    >
      {icon ? <View style={{ marginRight: 6 }}>{icon}</View> : null}

      <Text
        style={[
          styles.text,
          { color: stylesVariant.text, fontSize: sizeVariant.fontSize },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// ----------------------------------
// SIZE VARIANTS
// ----------------------------------
const sizeStyles = {
  sm: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontSize: textSizes.xs,
    radius: radii.sm,
  },
  md: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: textSizes.sm,
    radius: radii.md,
  },
};

// ----------------------------------
// COLOR VARIANTS (fully theme driven)
// ----------------------------------
const variantStyles = {
  neutral: {
    bg: colors.gray100,
    text: colors.textPrimary,
    border: colors.gray200,
  },
  success: {
    bg: colors.green50,
    text: colors.green700,
    border: colors.green200,
  },
  warning: {
    bg: colors.orange50,
    text: colors.orange700,
    border: colors.orange200,
  },
  danger: {
    bg: colors.red50,
    text: colors.red700,
    border: colors.red200,
  },
  info: {
    bg: colors.softblue100,
    text: colors.blue700,
    border: colors.softblue200,
  },
};

// ----------------------------------
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    alignSelf: "flex-start", // keeps badge sized to content
  },
  text: {
    fontWeight: fontWeights.medium,
  },
});
