// src/components/ui/Card.js

import React from "react";
import { View, StyleSheet } from "react-native";
import {
  colors,
  radius,
  spacing,
  shadows,
  variants,
  componentTokens,
} from "../../theme";

export default function Card({
  children,
  variant = "default", // default | muted | success | warning | danger
  elevated = true, // toggle shadow
  style = {},
  ...props
}) {
  // Resolve variant background & border
  const variantStyle = variants.card[variant] || variants.card.default;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
        },
        elevated && shadows.card,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: componentTokens.card.radius,
    borderWidth: 1,
    padding: componentTokens.card.padding,
  },
});
