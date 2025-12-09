// src/components/ui/Divider.js

import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacing } from "../../theme";

export default function Divider({
  inset = 0, // left padding
  style = {}, // custom override
  thickness = 1, // thickness of divider
  color = colors.divider, // customizable divider color
}) {
  return (
    <View
      style={[
        styles.divider,
        {
          marginLeft: inset,
          height: thickness,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    width: "100%",
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
});
